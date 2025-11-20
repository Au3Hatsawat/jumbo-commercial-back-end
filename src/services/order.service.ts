import ExcelJS from 'exceljs';
import { Decimal } from "@prisma/client/runtime/library";
import { Prisma, StockType } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import { ICreateOrderDto, OrderWithRelations } from "../types/order.type";
import { CustomerRepository } from "../repositories/customer.repository";
import { AppError } from "../utils/AppError";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { CategoryRepository } from "../repositories/category.repositoy";

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

    public async createOrder(orderData: ICreateOrderDto): Promise<OrderWithRelations> {
        return await prisma.$transaction(async (tx: PrismaTxClient) => {

            if (orderData.newCustomerPhone) {
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(orderData.newCustomerPhone)) {
                    throw new AppError(400, 'เบอร์โทรศัพท์ไม่ถูกต้อง', 'INVALID_PHONE_FORMAT');
                }
            }

            const productIds = orderData.items.map(i => i.productId);
            const productsInfo = await this.productRepository.findManyByIds(productIds, tx);

            const orderItemsData: Prisma.OrderItemCreateManyInput[] = [];
            let totalAmount = 0;

            for (const item of orderData.items) {
                const product = productsInfo.find(p => p.id === item.productId);
                if (!product) throw new AppError(404, `Product not found`, 'PRODUCT_NOT_FOUND');
                if (product.currentStock < item.quantity) throw new AppError(400, `Stock Insufficient`, 'STOCK_INSUFFICIENT');

                const sellingPriceNum = Number(product.sellingPrice);
                const averageCostNum = Number(product.averageCost);
                const itemTotal = sellingPriceNum * item.quantity;
                totalAmount += itemTotal;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: new Decimal(sellingPriceNum),
                    costAtSale: new Decimal(averageCostNum),
                    orderId: 0,
                });

                await this.productRepository.updateStock(product.id, -item.quantity, tx);
                await this.productRepository.createStockLog({
                    productId: product.id,
                    quantity: -item.quantity,
                    type: StockType.SALE,
                    costPrice: averageCostNum,
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

            const orderHeader = await this.orderRepository.createOrder({
                orderNo: 'ORDER-' + Date.now(),
                totalAmount: new Decimal(totalAmount),
                paymentMethod: orderData.paymentMethod,
                ...(effectiveCustomerId && {
                    customer: { connect: { id: effectiveCustomerId } }
                })
            }, tx);

            const finalOrderItems = orderItemsData.map(item => ({ ...item, orderId: orderHeader.id }));
            await this.orderRepository.createOrderItems(finalOrderItems, tx);

            const createdOrder = await this.orderRepository.findOrderById(orderHeader.id, tx);

            await this.analyticsService.syncOrderToAnalytics(createdOrder, tx);

            return createdOrder;
        });
    }

    public async exportOrdersToExcel(startDateStr?: string, endDateStr?: string): Promise<Buffer> {
        // 1. แปลงวันที่ (ถ้ามีส่งมา)
        const startDate = startDateStr ? new Date(startDateStr) : undefined;
        const endDate = endDateStr ? new Date(endDateStr) : undefined;

        if (startDate) {
            startDate.setHours(0, 0, 0, 0); // เซ็ตเป็น 00:00:00.000 (Local) -> จะได้ค่าประมาณ 17:00Z ของวันก่อนหน้า
        }

        // ถ้ามี endDate ให้บวกไปอีก 1 วัน (เพื่อให้ครอบคลุมถึงจบวันนั้น) หรือ set time เป็น 23:59:59
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        const orders = await this.orderRepository.findOrdersByDateRange(startDate, endDate);

        // 3. สร้าง Workbook และ Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // 4. กำหนด Header Columns
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
        ];

        // 5. จัด Style Header (สีเขียว Emerald, ตัวหนา)
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // ตัวขาว
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF059669' } // สีเขียว Emerald-600
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // 6. วนลูปใส่ข้อมูล
        orders.forEach(order => {
            const date = new Date(order.createdAt);

            const row = worksheet.addRow({
                id: order.id,
                date: date.toLocaleDateString('th-TH'),
                time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                orderNo: order.orderNo,
                customer: order.customer?.name || 'ลูกค้าทั่วไป',
                phone: order.customer?.phoneNumber || '-',
                payment: order.paymentMethod,
                itemsCount: order.items.length,
                total: Number(order.totalAmount) // แปลง Decimal เป็น Number
            });

            // จัด Format ช่องตัวเลข
            row.getCell('total').numFmt = '#,##0.00';
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