import { Prisma, SellType, StockType } from "../generated/prisma/client";

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
        baseUnit: true,
        sellingUnits: {
            include: {
                unit: true
            }
        },
        stockLogs: true 
    }
}>

export interface ISellingUnitDto {
    barcode: string;
    unitId: number;
    multiplier: number;
    price: number;
    sellType: SellType;
}

export interface ICreateProductDto {
    name: string;
    categoryId: number; 
    baseUnitId: number;
    description?: string;
    imageUrl?: string;
    sellingUnits: ISellingUnitDto[];
}

export interface IAddSellingUnitDto {
    barcode: string;
    unitId: number;
    multiplier: number;
    price: number;
    sellType: SellType; 
}