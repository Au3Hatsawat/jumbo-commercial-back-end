import { Prisma, Product, StockType } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { ICreateProductDto, ProductWithRelations } from "../types/product.type";

export class ProductRepository {

    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async insertProduct(product: Prisma.ProductCreateInput, tx?: PrismaTxClient): Promise<Product> {
        return this.getClient(tx).product.create({
            data: product,
        })
    }

    public async findAll(tx?: PrismaTxClient, includeStockLogs: boolean = false): Promise<Product[] | ProductWithRelations[]> {
        const query: Prisma.ProductFindManyArgs = {};

        if (includeStockLogs) {
            query.include = {
                category: true,
                unit: true,
                stockLogs: true 
            };
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
                id: {
                    in: ids
                }
            }
        };

        if (includeStockLogs) {
            query.include = { 
                category: true,
                unit: true,
                stockLogs: true  
            };
        }

        return this.getClient(tx).product.findMany(query) as Promise<Product[] | ProductWithRelations[]>;
    }

    public async findById(id: number, includeStockLogs: boolean = false, tx?: PrismaTxClient): Promise<Product | ProductWithRelations> {

        const query: Prisma.ProductFindUniqueOrThrowArgs = {
            where: { id },
        };

        if (includeStockLogs) {
            query.include = { 
                category: true,
                unit: true,
                stockLogs: true  
            };
        }

        return this.getClient(tx).product.findUniqueOrThrow(query) as Promise<Product | ProductWithRelations>;
    }

    public async updateProduct(id: number, data: Prisma.ProductUpdateInput , tx?: PrismaTxClient): Promise<Product> {
        return this.getClient(tx).product.update({ where: { id }, data });
    }

    public async createStockLog(data: {
        productId: number,
        quantity: number,
        costPrice?: number,
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
}