import { Prisma, FactDailySummary } from "../generated/prisma/client"; 
import { prisma, PrismaTxClient } from "../libs/prisma";
import { CategorySalesResult, TopProductResult } from "../types/analytics.type";

export class AnalyticsRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async createManyFactSales(data: Prisma.FactSaleCreateManyInput[], tx?: PrismaTxClient): Promise<Prisma.BatchPayload> {
        return this.getClient(tx).factSale.createMany({
            data
        });
    }

    public async upsertDailySummary(
        date: Date,
        summaryData: {
            totalOrders: number;
            totalSales: number | Prisma.Decimal;
            totalCost: number | Prisma.Decimal;
            totalProfit: number | Prisma.Decimal;
        },
        tx?: PrismaTxClient
    ): Promise<FactDailySummary> {
        return this.getClient(tx).factDailySummary.upsert({
            where: {
                date: date
            },
            update: {
                totalOrders: { increment: summaryData.totalOrders },
                totalSales: { increment: summaryData.totalSales },
                totalCost: { increment: summaryData.totalCost },
                totalProfit: { increment: summaryData.totalProfit },
            },
            create: {
                date: date,
                totalOrders: summaryData.totalOrders,
                totalSales: summaryData.totalSales,
                totalCost: summaryData.totalCost,
                totalProfit: summaryData.totalProfit,
            }
        });
    }

    public async getDailySummaries(startDate: Date, endDate: Date): Promise<FactDailySummary[]> {
        return this.getClient().factDailySummary.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
    }

    public async getTopSellingProducts(limit: number = 5): Promise<TopProductResult[]> {
        const result = await this.getClient().factSale.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                baseUnitQuantity: true,
                totalPrice: true
            },
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            },
            take: limit
        });

        return result as unknown as TopProductResult[];
    }

    public async getSalesByCategory(startDate: Date, endDate: Date): Promise<CategorySalesResult[]> {
        const result = await this.getClient().factSale.groupBy({
            by: ['categoryId'],
            _sum: {
                totalPrice: true
            },
            where: {
                dateKey: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            }
        });
        
        return result as unknown as CategorySalesResult[];
    }

    public async getSalesByPaymentMethod(startDate: Date, endDate: Date) {
        return this.getClient().order.groupBy({
            by: ['paymentMethod'],
            _sum: {
                totalAmount: true
            },
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });
    }

    public async getTopCustomers(limit: number = 5) {
        return this.getClient().factSale.groupBy({
            by: ['customerId'],
            _sum: {
                totalPrice: true
            },
            where: {
                customerId: {
                    not: null 
                }
            },
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            },
            take: limit
        });
    }

    public async getCustomersByIds(ids: number[]) {
        return this.getClient().customer.findMany({
            where: { id: { in: ids } },
            select: { id: true, name: true, phoneNumber: true }
        });
    }
}