import { Prisma } from "../generated/prisma/client";

export interface IOrderItemDto {
    sellingUnitId: number;
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
    include: {
        items: true;
        customer: true;
    }
}>;