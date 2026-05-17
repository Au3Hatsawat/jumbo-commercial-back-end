import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "../generated/prisma/client";
import { PrismaTxClient } from "../libs/prisma";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { OrderWithRelations } from "../types/order.type";
import { CategoryRepository } from "../repositories/category.repositoy";
import { ProductRepository } from "../repositories/product.repository";
import dayjs from '../libs/dayjs';

export class AnalyticsService {
    constructor(
        private analyticsRepository: AnalyticsRepository,
        private categoryRepository: CategoryRepository,
        private productRepository: ProductRepository,
    ) { }

    public async syncOrderToAnalytics(order: OrderWithRelations, tx: PrismaTxClient): Promise<void> {
        const orderItems = order.items;
        if (!orderItems || orderItems.length === 0) return;

        const tz = process.env.BUSINESS_TIMEZONE || 'UTC';
        const dateString = dayjs(order.createdAt).tz(tz).format('YYYY-MM-DD');
        const dateKey = new Date(`${dateString}T00:00:00.000Z`);
        const now = new Date();

        const factSalesData: Prisma.FactSaleCreateManyInput[] = [];

        let orderTotalCost = new Decimal(0);
        let orderTotalProfit = new Decimal(0);

        const productIds = orderItems.map(item => item.productId);
        const productsInfo = await this.productRepository.findManyByIds(productIds, tx);
        const categoryMap: Record<number, number> = {};
        productsInfo.forEach(p => {
            categoryMap[p.id] = p.categoryId;
        });

        for (const item of orderItems) {
            const quantity = item.quantity;
            const price = new Decimal(item.priceAtSale);
            const cost = new Decimal(item.costAtSale);  

            const totalPrice = price.mul(quantity);
            const totalCost = cost.mul(quantity);

            const profit = totalPrice.minus(totalCost);

            orderTotalCost = orderTotalCost.plus(totalCost);
            orderTotalProfit = orderTotalProfit.plus(profit);

            factSalesData.push({
                orderId: order.id,
                productId: item.productId,
                categoryId: categoryMap[item.productId],
                customerId: order.customerId,
                dateKey: dateKey,
                timeKey: now,
                sellType: item.sellType || 'RETAIL',
                quantity: quantity,
                baseUnitQuantity: quantity * item.multiplierAtSale,
                totalPrice: totalPrice,
                totalCost: totalCost,
                profit: profit
            });
        }

        await this.analyticsRepository.createManyFactSales(factSalesData, tx);

        await this.analyticsRepository.upsertDailySummary(dateKey, {
            totalOrders: 1,
            totalSales: order.totalAmount,
            totalCost: orderTotalCost,
            totalProfit: orderTotalProfit
        }, tx);
    }

    public async getDashboardSummary(days: number = 30) {
        const tz = process.env.BUSINESS_TIMEZONE || 'UTC';
        const dateString = dayjs().tz(tz).format('YYYY-MM-DD');

        const endDate = new Date(dateString);
        const startDate = new Date(dateString);
        startDate.setDate(startDate.getDate() - days);

        const summaries = await this.analyticsRepository.getDailySummaries(startDate, endDate);

        return summaries.map(s => ({
            ...s,
            totalSales: Number(s.totalSales),
            totalCost: Number(s.totalCost),
            totalProfit: Number(s.totalProfit)
        }));
    }

    public async getTopProducts() {
        const topProducts = await this.analyticsRepository.getTopSellingProducts(5);

        if (topProducts.length === 0) return [];

        const productIds = topProducts.map(p => p.productId);

        const productsInfo = await this.productRepository.findManyByIds(productIds);

        return topProducts.map(stat => {
            const product = productsInfo.find(p => p.id === stat.productId);
            return {
                productId: stat.productId,
                productName: product ? product.name : 'สินค้าไม่ระบุชื่อ',
                _sum: {
                    quantity: stat._sum.quantity,
                    baseUnitQuantity: stat._sum.baseUnitQuantity,
                    totalPrice: Number(stat._sum.totalPrice || 0)
                }
            };
        });
    }

    public async getSalesByCategoryDistribution(lang: string, days: number = 30) {
        const tz = process.env.BUSINESS_TIMEZONE || 'UTC';
        const dateString = dayjs().tz(tz).format('YYYY-MM-DD');

        const endDate = new Date(dateString);
        const startDate = new Date(dateString);
        startDate.setDate(startDate.getDate() - days);

        const rawStats = await this.analyticsRepository.getSalesByCategory(startDate, endDate);
        const categories = await this.categoryRepository.findAllCategory({});

        return rawStats.map(stat => {
            const category = categories.find(c => c.id === stat.categoryId);
            return {
                categoryId: stat.categoryId,
                categoryName: category ? (lang === 'en' ? category.nameEn : category.nameTh) : 'Unknown',
                totalSales: Number(stat._sum.totalPrice || 0)
            };
        });
    }

    public async getPaymentMethodDistribution(lang: string, days: number = 30) {
        const tz = process.env.BUSINESS_TIMEZONE || 'Asia/Bangkok';
        
        const endDate = dayjs().tz(tz).endOf('day').toDate();
        const startDate = dayjs().tz(tz).subtract(days, 'day').startOf('day').toDate();

        const rawStats = await this.analyticsRepository.getSalesByPaymentMethod(startDate, endDate);

        return rawStats.map(stat => {
            const method = stat.paymentMethod || 'UNKNOWN';
            let name = method;
            
            if (lang === 'th') {
                if (method.toUpperCase() === 'CASH') name = 'เงินสด';
                else if (method.toUpperCase() === 'QR') name = 'โอนเงิน/สแกน';
                else if (method.toUpperCase() === 'TRANSFER' || method.toUpperCase() === 'PROMPTPAY') name = 'โอนเงิน/สแกน';
                else if (method.toUpperCase() === 'CREDIT_CARD') name = 'บัตรเครดิต';
                else name = 'ไม่ระบุ';
            } else {
                name = method.replace('_', ' ').toUpperCase();
            }

            return {
                paymentMethod: method,
                name: name, 
                value: Number(stat._sum.totalAmount || 0)
            };
        });
    }

    public async getTopCustomers() {
        const topSpenders = await this.analyticsRepository.getTopCustomers(5);
        if (topSpenders.length === 0) return [];

        const customerIds = topSpenders.map(c => c.customerId as number);
        
        const customersInfo = await this.analyticsRepository.getCustomersByIds(customerIds);

        return topSpenders.map(stat => {
            const customer = customersInfo.find(c => c.id === stat.customerId);
            
            const displayName = customer?.name 
                ? customer.name 
                : (customer?.phoneNumber ? customer.phoneNumber : 'ลูกค้าทั่วไป');

            return {
                customerId: stat.customerId,
                customerName: displayName,
                totalSales: Number(stat._sum.totalPrice || 0)
            };
        });
    }
}

const analyticsRepository = new AnalyticsRepository();
const categoryRepository = new CategoryRepository();
const productRepository = new ProductRepository();

export const analyticsService = new AnalyticsService(analyticsRepository, categoryRepository, productRepository);