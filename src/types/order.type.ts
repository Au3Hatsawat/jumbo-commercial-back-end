import { Prisma, Product } from "../generated/prisma/client";

export interface IOrderItemDto {
    productId: number;
    quantity: number;
}

export interface ICreateOrderDto {
    customerId?: number; 
    newCustomerName?: string;
    newCustomerPhone?: string;
    items: IOrderItemDto[];
    paymentMethod: string;
}

export type OrderWithRelations = Prisma.OrderGetPayload<{
    include: { items: { include: { product: true } }, customer: true }
}>;

export type ProductSaleInfo = Pick<
    Product, 
    'id' | 'sellingPrice' | 'averageCost' | 'currentStock'
>;