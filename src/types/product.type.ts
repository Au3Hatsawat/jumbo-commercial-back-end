import { Prisma, StockType } from "../generated/prisma/client";

export interface IRestockDto {
    quantityToAdd: number;
    costPerUnit: number;
    note?: string;
}

export interface IstockDto {
    quantity: number;
    stockType: StockType;
    note?: string;
}

export interface ProductResponse {
    id: number;
    name: string;
    currentStock: number;
    averageCost: number;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        category: true,
        unit: true,
        stockLogs: true 
    }
}>

export interface ICreateProductDto {
    barcode: string;
    name: string;
    sellingPrice: number;
    categoryId: number; 
    unitId: number;
    description?: string;
    imageUrl?: string;
}