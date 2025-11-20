import { Decimal } from "@prisma/client/runtime/library";
import { Prisma } from "../generated/prisma/client";
import { PrismaTxClient } from "../libs/prisma";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { OrderWithRelations } from "../types/order.type";
import { CategoryRepository } from "../repositories/category.repositoy";
import { ProductRepository } from "../repositories/product.repository";

export class AnalyticsService {
    constructor(
        private analyticsRepository: AnalyticsRepository,
        private categoryRepository: CategoryRepository,
        private productRepository: ProductRepository,
    ) { }

    public async syncOrderToAnalytics(order: OrderWithRelations, tx: PrismaTxClient): Promise<void> {
        const orderItems = order.items;
        if (!orderItems || orderItems.length === 0) return;

        const now = new Date();
        // สร้าง DateKey แบบตัดเวลาทิ้ง (Set เป็น 00:00:00 UTC หรือตาม timezone local)
        const dateKey = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const factSalesData: Prisma.FactSaleCreateManyInput[] = [];

        let orderTotalCost = new Decimal(0);
        let orderTotalProfit = new Decimal(0);

        for (const item of orderItems) {
            const quantity = item.quantity;
            const price = new Decimal(item.price); // ราคาขายต่อหน่วย
            const cost = new Decimal(item.costAtSale); // ต้นทุนต่อหน่วย (snapshot)

            const totalPrice = price.mul(quantity);
            const totalCost = cost.mul(quantity);
            const profit = totalPrice.minus(totalCost);

            // เก็บยอดรวมเพื่ออัปเดต Daily Summary
            orderTotalCost = orderTotalCost.plus(totalCost);
            orderTotalProfit = orderTotalProfit.plus(profit);

            factSalesData.push({
                orderId: order.id,
                productId: item.productId,
                categoryId: item.product.categoryId, // ต้องแน่ใจว่าใน OrderWithRelations include product มาด้วย
                customerId: order.customerId,
                dateKey: dateKey,
                timeKey: now,
                quantity: quantity,
                totalPrice: totalPrice,
                totalCost: totalCost,
                profit: profit
            });
        }

        // 1. Insert ลง FactSale (ทีเดียวหลาย row)
        await this.analyticsRepository.createManyFactSales(factSalesData, tx);

        // 2. Update/Insert ลง FactDailySummary
        await this.analyticsRepository.upsertDailySummary(dateKey, {
            totalOrders: 1,
            totalSales: order.totalAmount,
            totalCost: orderTotalCost,
            totalProfit: orderTotalProfit
        }, tx);
    }
    public async getDashboardSummary(days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
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
                    totalPrice: Number(stat._sum.totalPrice || 0) 
                }
            };
        });
    }

    public async getSalesByCategoryDistribution(days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. ดึงยอดขายแยกตาม Category ID
        const rawStats = await this.analyticsRepository.getSalesByCategory(startDate, endDate);

        // 2. ดึงชื่อ Category ทั้งหมดเพื่อมา map ชื่อ
        // (หรือจะ select where id in [...] ก็ได้ถ้าหมวดหมู่เยอะ)
        const categories = await this.categoryRepository.findAllCategory();

        // 3. Map ข้อมูลรวมกัน
        return rawStats.map(stat => {
            const category = categories.find(c => c.id === stat.categoryId);
            return {
                categoryId: stat.categoryId,
                categoryName: category ? category.nameTh : 'Unknown',
                totalSales: Number(stat._sum.totalPrice || 0)
            };
        });
    }
}

const analyticsRepository = new AnalyticsRepository();
const categoryRepository = new CategoryRepository();
const productRepository = new ProductRepository();

export const analyticsService = new AnalyticsService(analyticsRepository, categoryRepository, productRepository);