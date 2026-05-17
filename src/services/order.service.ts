import ExcelJS from 'exceljs';
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma, StockType } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ICreateOrderDto, OrderWithRelations } from "../types/order.type";
import { CustomerRepository } from "../repositories/customer.repository";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { CategoryRepository } from "../repositories/category.repositoy";
import { AppError } from '../utils/errutils/appError';

export class OrderService {

    constructor(
        private orderRepository: OrderRepository,
        private productRepository: ProductRepository,
        private customerRepository: CustomerRepository,
        private analyticsService: AnalyticsService
    ) { }

    public async getAllOrder(): Promise<OrderWithRelations[]> {
        return await prisma.$transaction(async (tx: PrismaTxClient) => {
            const orders = await this.orderRepository.findAllOrder(tx);
            return orders;
        })
    }

    public async getOrderById(orderId: number): Promise<OrderWithRelations> {
        return await prisma.$transaction(async (tx: PrismaTxClient) => {
            const order = await this.orderRepository.findOrderById(orderId, tx);
            if (!order) {
                throw new AppError('OD000100');
            }
            return order;
        });
    }

    public async createOrder(orderData: ICreateOrderDto): Promise<OrderWithRelations> {
        return await prisma.$transaction(async (tx: PrismaTxClient) => {

            if (orderData.newCustomerPhone) {
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(orderData.newCustomerPhone)) {
                    throw new AppError('OD000000');
                }
            }

            const sellingUnitIds = orderData.items.map(i => i.sellingUnitId);

            const sellingUnitsInfo = await tx.productSellingUnit.findMany({
                where: { id: { in: sellingUnitIds } },
                include: {
                    product: true,
                    unit: true
                }
            });

            const currentStockMap: Record<number, number> = {};
            sellingUnitsInfo.forEach(su => {
                if (currentStockMap[su.productId] === undefined) {
                    currentStockMap[su.productId] = su.product.currentStock;
                }
            });

            const orderItemsData: Prisma.OrderItemCreateManyInput[] = [];
            let totalAmount = 0;

            for (const item of orderData.items) {
                const sellingUnit = sellingUnitsInfo.find(su => su.id === item.sellingUnitId);

                if (!sellingUnit) throw new AppError('OD000001');

                const actualDeductQuantity = item.quantity * sellingUnit.multiplier;

                if (currentStockMap[sellingUnit.productId] < actualDeductQuantity) {
                    throw new AppError('OD000002');
                }

                currentStockMap[sellingUnit.productId] -= actualDeductQuantity;

                const sellingPriceNum = Number(sellingUnit.price);
                const averageCostNum = Number(sellingUnit.product.averageCost);
                const costAtSaleNum = averageCostNum * sellingUnit.multiplier;

                const itemTotal = sellingPriceNum * item.quantity;
                totalAmount += itemTotal;

                orderItemsData.push({
                    productId: sellingUnit.productId,
                    sellingUnitId: sellingUnit.id,

                    productName: sellingUnit.product.name,
                    unitName: sellingUnit.unit.nameTh,
                    unitNameEn: sellingUnit.unit.nameEn,
                    imageUrl: sellingUnit.imageUrl || sellingUnit.product.imageUrl || "",
                    sellType: sellingUnit.sellType,

                    quantity: item.quantity,
                    priceAtSale: new Decimal(sellingPriceNum),
                    costAtSale: new Decimal(costAtSaleNum),
                    multiplierAtSale: sellingUnit.multiplier,
                    vatRate: sellingUnit.product.vatRate,
                    orderId: 0,
                });

                await this.productRepository.updateStock(sellingUnit.productId, -actualDeductQuantity, tx);
                await this.productRepository.createStockLog({
                    productId: sellingUnit.productId,
                    quantity: -actualDeductQuantity,
                    type: StockType.SALE,
                    costPrice: new Decimal(averageCostNum),
                }, tx);
            }

            let effectiveCustomerId: number | null | undefined = null;
            if (orderData.newCustomerPhone) {
                const customer = await this.customerRepository.findCustomer({ phoneNumber: orderData.newCustomerPhone }, tx);
                if (customer) {
                    effectiveCustomerId = customer.id;
                } else {
                    const newCustomer = await this.customerRepository.createCustomer({
                        name: orderData.newCustomerName || 'สมาชิก',
                        phoneNumber: orderData.newCustomerPhone,
                    }, tx);
                    effectiveCustomerId = newCustomer.id;
                }
            }

            const createAt = new Date();

            const orderHeader = await this.orderRepository.createOrder({
                orderNo: 'ORDER-' + Date.now(),
                totalAmount: new Decimal(totalAmount),
                paymentMethod: orderData.paymentMethod,
                ...(effectiveCustomerId && {
                    customer: { connect: { id: effectiveCustomerId } }
                }),
                createdAt: createAt,
                updatedAt: createAt,
            }, tx);

            const finalOrderItems = orderItemsData.map(item => ({ ...item, orderId: orderHeader.id }));
            await this.orderRepository.createOrderItems(finalOrderItems, tx);

            const createdOrder = await this.orderRepository.findOrderById(orderHeader.id, tx);

            await this.analyticsService.syncOrderToAnalytics(createdOrder, tx);

            return createdOrder;
        });
    }

    public async exportOrdersToExcel(startDateStr?: string, endDateStr?: string): Promise<Buffer> {
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        if (startDate) {
            startDate.setHours(0, 0, 0, 0);
        }

        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        const orders = await this.orderRepository.findOrdersByDateRange(startDate, endDate);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'วันที่', key: 'date', width: 15 },
            { header: 'เวลา', key: 'time', width: 10 },
            { header: 'เลขที่บิล', key: 'orderNo', width: 20 },
            { header: 'ลูกค้า', key: 'customer', width: 20 },
            { header: 'เบอร์โทร', key: 'phone', width: 15 },
            { header: 'วิธีชำระ', key: 'payment', width: 15 },
            { header: 'จำนวนรายการ', key: 'itemsCount', width: 15 },
            { header: 'ยอดสุทธิ (บาท)', key: 'total', width: 20 },
            { header: 'รายการสินค้า', key: 'itemsDetail', width: 50 },
        ];

        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF059669' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        orders.forEach(order => {
            const date = new Date(order.createdAt);

            const itemsDetail = order.items.map(item => {
                const name = item.productName || 'ไม่ระบุชื่อสินค้า';
                return `${name} (x${item.quantity * item.multiplierAtSale})`;
            }).join(', ');

            const row = worksheet.addRow({
                id: order.id,
                date: date.toLocaleDateString('th-TH'),
                time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                orderNo: order.orderNo,
                customer: order.customer?.name || 'ลูกค้าทั่วไป',
                phone: order.customer?.phoneNumber || '-',
                payment: order.paymentMethod,
                itemsCount: order.items.length,
                total: Number(order.totalAmount),
                itemsDetail: itemsDetail
            });

            row.getCell('total').numFmt = '#,##0.00';

            row.getCell('itemsDetail').alignment = { wrapText: true, vertical: 'top' };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer as unknown as Buffer;
    }
}

const productRepository = new ProductRepository();
const orderRepository = new OrderRepository();
const customerRepository = new CustomerRepository();
const analyticsRepository = new AnalyticsRepository();
const categoryRepository = new CategoryRepository();

const analyticsService = new AnalyticsService(analyticsRepository, categoryRepository, productRepository);

export const orderService = new OrderService(
    orderRepository,
    productRepository,
    customerRepository,
    analyticsService
);