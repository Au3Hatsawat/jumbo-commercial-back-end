import { Order, Prisma } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { OrderWithRelations } from "../types/order.type";

export class OrderRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async findAllOrder(tx?: PrismaTxClient): Promise<OrderWithRelations[]> {
        return this.getClient(tx).order.findMany({
            include: {
                customer: true,
                items: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    public async findOrderById(orderId: number, tx?: PrismaTxClient): Promise<OrderWithRelations> {
        return this.getClient(tx).order.findUniqueOrThrow({
            where: {
                id: orderId,
            },
            include: {
                customer: true,
                items: true 
            }
        });
    }

    public async createOrder(data: Prisma.OrderCreateInput, tx: PrismaTxClient): Promise<Order> {
        return this.getClient(tx).order.create({ data });
    }

    public async createOrderItems(data: Prisma.OrderItemCreateManyInput[], tx: PrismaTxClient): Promise<Prisma.BatchPayload> {
        return this.getClient(tx).orderItem.createMany({
            data,
            skipDuplicates: true
        });
    }

    public async findOrdersByDateRange(startDate?: Date, endDate?: Date, tx?: PrismaTxClient) {
        return this.getClient(tx).order.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            include: {
                customer: true,
                items: true 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
}