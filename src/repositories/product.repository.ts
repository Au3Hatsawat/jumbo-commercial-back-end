import { Decimal } from "@prisma/client/runtime/library";
import { Prisma, Product, ProductSellingUnit, StockType } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { ICreateProductDto, ProductWithRelations } from "../types/product.type";

export class ProductRepository {

    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    private get baseInclude() {
        return {
            category: true,
            baseUnit: true,
            sellingUnits: {
                include: {
                    unit: true
                }
            }
        };
    }

    public async insertProduct(product: Prisma.ProductCreateInput, tx?: PrismaTxClient): Promise<Product> {
        return this.getClient(tx).product.create({
            data: product,
        });
    }

    public async createSellingUnit(
        data: Prisma.ProductSellingUnitCreateInput,
        tx?: PrismaTxClient
    ): Promise<ProductSellingUnit> {
        return this.getClient(tx).productSellingUnit.create({
            data,
        });
    }

    public async updateSellingUnit(id: number, data:Prisma.ProductSellingUnitUpdateInput, tx?: PrismaTxClient): Promise<ProductSellingUnit> {
        return this.getClient(tx).productSellingUnit.update({
            where: {id},
            data
        })
    }

    public async findSellingUnitById(id:number, tx?: PrismaTxClient): Promise<ProductSellingUnit> {
        return this.getClient(tx).productSellingUnit.findUniqueOrThrow({
            where: {id}
        })
    }

    public async findAll(tx?: PrismaTxClient, includeStockLogs: boolean = false): Promise<Product[] | ProductWithRelations[]> {
        const query: Prisma.ProductFindManyArgs = {
            where: {
                isDeleted: false
            },
            include: { ...this.baseInclude }
        };

        if (includeStockLogs && query.include) {
            query.include.stockLogs = true;
        }

        return this.getClient(tx).product.findMany(query) as Promise<Product[] | ProductWithRelations[]>;
    }

    public async findManyByIds(
        ids: number[],
        tx?: PrismaTxClient,
        includeStockLogs: boolean = false
    ): Promise<Product[] | ProductWithRelations[]> {
        const query: Prisma.ProductFindManyArgs = {
            where: {
                id: { in: ids },
                isDeleted: false
            },
            include: { ...this.baseInclude }
        };

        if (includeStockLogs && query.include) {
            query.include.stockLogs = true;
        }

        return this.getClient(tx).product.findMany(query) as Promise<Product[] | ProductWithRelations[]>;
    }

    public async findById(id: number, includeStockLogs: boolean = false, tx?: PrismaTxClient): Promise<Product | ProductWithRelations> {
        const query: Prisma.ProductFindUniqueOrThrowArgs = {
            where: { 
                id,
                isDeleted: false
            },
            include: { ...this.baseInclude }
        };

        if (includeStockLogs && query.include) {
            query.include.stockLogs = true;
        }

        return this.getClient(tx).product.findUniqueOrThrow(query) as Promise<Product | ProductWithRelations>;
    }

    public async updateProduct(id: number, data: Prisma.ProductUpdateInput, tx?: PrismaTxClient): Promise<Product> {
        return this.getClient(tx).product.update({
            where: { id },
            data
        });
    }

    public async createStockLog(data: {
        productId: number,
        quantity: number,
        costPrice?: Decimal | number,
        type: StockType,
        note?: string
    }, tx?: PrismaTxClient): Promise<any> {
        return this.getClient(tx).stockLog.create({
            data: {
                ...data,
            }
        });
    }

    public async updateStock(
        id: number,
        quantityChange: number,
        tx?: PrismaTxClient
    ): Promise<Product> {
        return this.getClient(tx).product.update({
            where: { id },
            data: {
                currentStock: {
                    increment: quantityChange
                },
            },
        });
    }

    public async deleteProductSellingUnit(id: number , tx?: PrismaTxClient): Promise<ProductSellingUnit> {
        return this.getClient(tx).productSellingUnit.delete({
            where: {id}
        })
    }
}