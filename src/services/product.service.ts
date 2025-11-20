import { Prisma, Product, StockType } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { ProductRepository } from "../repositories/product.repository";
import { ICreateProductDto, IRestockDto, IstockDto, ProductWithRelations } from "../types/product.type";

export class ProductService {

    constructor(private productRepository: ProductRepository) { }

    public async getAllProduct(): Promise<Product[] | ProductWithRelations[]> {
        return await prisma.$transaction(async (tx) => {
            const products = await this.productRepository.findAll(tx, true);

            return products;
        })
    }

    public async updateProduct(productId: number , data: Prisma.ProductUpdateInput): Promise<Product> {
        return await prisma.$transaction(async (tx) => {
            const product = await this.productRepository.updateProduct(productId , data , tx);
            return product;
        })
    }

    public async createProduct(data: ICreateProductDto): Promise<Product> {
        return await prisma.$transaction(async (tx) => {

            const { categoryId, unitId, ...productData } = data;

            const prismaData: Prisma.ProductCreateInput = {
                ...productData, 
                category: {
                    connect: { id: categoryId } 
                },
                unit: {
                    connect: { id: unitId } 
                },
                stockLogs: undefined,
                orderItems: undefined,
            };

            const product = await this.productRepository.insertProduct(prismaData, tx);

            return product;
        })
    }

    public async updateStockProduct(productId: number, data: IstockDto): Promise<Product> {
        return await prisma.$transaction(async (tx) => {
            const { quantity, note, stockType } = data;

            const updatedProduct = await this.productRepository.updateProduct(productId, {
                currentStock: { increment: quantity },
            }, tx);

            await this.productRepository.createStockLog({
                productId,
                quantity: quantity,
                type: stockType,
                note,
            }, tx);

            return updatedProduct;
        })
    }

    public async restockProduct(productId: number, data: IRestockDto): Promise<Product> {

        const { quantityToAdd, costPerUnit, note } = data;

        if (quantityToAdd <= 0) {
            throw new Error("Quantity must be positive.");
        }

        return await prisma.$transaction(async (tx) => {

            const product = await this.productRepository.findById(productId, true, tx);

            const currentStock = product.currentStock;
            const currentAvgCost = Number(product.averageCost);
            const newCost = Number(costPerUnit);

            const oldTotalValue = currentStock * currentAvgCost;
            const newTotalValue = quantityToAdd * newCost;
            const totalQuantity = currentStock + quantityToAdd;

            let newAverageCost = 0;
            if (totalQuantity > 0) {
                newAverageCost = (oldTotalValue + newTotalValue) / totalQuantity;
            } else {
                newAverageCost = newCost;
            }

            const updatedProduct = await this.productRepository.updateProduct(productId, {
                currentStock: { increment: quantityToAdd },
                averageCost: newAverageCost,
            }, tx);

            await this.productRepository.createStockLog({
                productId,
                quantity: quantityToAdd,
                costPrice: newCost,
                type: StockType.RESTOCK,
                note,
            }, tx);

            return updatedProduct;
        });
    }
}

const productRepository = new ProductRepository();
export const productService = new ProductService(productRepository);