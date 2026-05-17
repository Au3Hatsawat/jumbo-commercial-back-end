import { Prisma, Product, ProductSellingUnit, StockType } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { ProductRepository } from "../repositories/product.repository";
import { IAddSellingUnitDto, ICreateProductDto, IRestockDto, IstockDto, ProductWithRelations } from "../types/product.type";

export class ProductService {

    constructor(private productRepository: ProductRepository) { }

    public async getAllProduct(): Promise<Product[] | ProductWithRelations[]> {
        return await prisma.$transaction(async (tx) => {
            const products = await this.productRepository.findAll(tx, true);
            const IMAGE_URL = process.env.IMAGE_URL;
            products.map((prod) => {
                if (prod.imageUrl && IMAGE_URL) {
                    prod.imageUrl = IMAGE_URL + prod.imageUrl;
                } else {
                    prod.imageUrl = null;
                }
                if ('sellingUnits' in prod && prod.sellingUnits) {
                    prod.sellingUnits.map((unit) => {
                        if (unit.imageUrl && IMAGE_URL) {
                            unit.imageUrl = IMAGE_URL + unit.imageUrl;
                        } else {
                            unit.imageUrl = null;
                        }
                    })
                }
            })
            return products;
        });
    }

    public async getProductById(productId: number): Promise<Product | ProductWithRelations> {
        return await prisma.$transaction(async (tx) => {
            const product = await this.productRepository.findById(productId, true, tx);
            const IMAGE_URL = process.env.IMAGE_URL;
            if (product.imageUrl && IMAGE_URL) {
                product.imageUrl = IMAGE_URL + product.imageUrl;
            }
            if ('sellingUnits' in product && product.sellingUnits) {
                product.sellingUnits.map((unit) => {
                    if (unit.imageUrl && IMAGE_URL) {
                        unit.imageUrl = IMAGE_URL + unit.imageUrl;
                    } else {
                        unit.imageUrl = null;
                    }
                })
            }
            return product;
        });
    }

    public async getProductSellingUnitById(id: number): Promise<ProductSellingUnit> {
        return await prisma.$transaction(async (tx) => {
            const productSellingUnit = await this.productRepository.findSellingUnitById(id, tx);
            const IMAGE_URL = process.env.IMAGE_URL;
            if (productSellingUnit.imageUrl && IMAGE_URL) {
                productSellingUnit.imageUrl = IMAGE_URL + productSellingUnit.imageUrl;
            } else {
                productSellingUnit.imageUrl = null;
            }
            return productSellingUnit;
        })
    }

    public async updateProduct(productId: number, data: Prisma.ProductUpdateInput): Promise<Product> {
        return await prisma.$transaction(async (tx) => {
            const product = await this.productRepository.updateProduct(productId, data, tx);
            return product;
        });
    }

    public async createProduct(data: ICreateProductDto): Promise<Product> {
        return await prisma.$transaction(async (tx) => {
            const { categoryId, baseUnitId, sellingUnits, ...productData } = data;

            const prismaData: Prisma.ProductCreateInput = {
                ...productData,
                category: {
                    connect: { id: categoryId }
                },
                baseUnit: {
                    connect: { id: baseUnitId }
                },
                sellingUnits: {
                    create: sellingUnits.map(su => ({
                        barcode: su.barcode,
                        multiplier: su.multiplier,
                        price: su.price,
                        sellType: su.sellType,
                        unit: {
                            connect: { id: su.unitId }
                        }
                    }))
                }
            };

            const product = await this.productRepository.insertProduct(prismaData, tx);
            return product;
        });
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
        });
    }

    public async updateSellingUnit(sellingUnitId: number, data: Prisma.ProductSellingUnitUpdateInput): Promise<ProductSellingUnit> {
        return await prisma.$transaction(async (tx) => {
            const updatedProductSellingUnit = await this.productRepository.updateSellingUnit(sellingUnitId, data, tx);

            return updatedProductSellingUnit;
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

    public async addSellingUnit(productId: number, data: IAddSellingUnitDto) {
        return await prisma.$transaction(async (tx) => {

            await this.productRepository.findById(productId, false, tx);

            const prismaData: Prisma.ProductSellingUnitCreateInput = {
                barcode: data.barcode,
                multiplier: data.multiplier,
                price: data.price,
                sellType: data.sellType,
                product: {
                    connect: { id: productId }
                },
                unit: {
                    connect: { id: data.unitId }
                }
            };

            const newSellingUnit = await this.productRepository.createSellingUnit(prismaData, tx);
            return newSellingUnit;
        });
    }

    public async deleteProductSellingUnit(id: number) {
        return await prisma.$transaction(async (tx) => {
            await this.productRepository.findSellingUnitById(id, tx);

            const productSellingUnit = await this.productRepository.deleteProductSellingUnit(id, tx);

            return productSellingUnit;
        })
    }
}

const productRepository = new ProductRepository();
export const productService = new ProductService(productRepository);