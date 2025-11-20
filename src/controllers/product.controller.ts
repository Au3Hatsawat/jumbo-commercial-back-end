import { Request, Response, NextFunction } from 'express';
import { ICreateProductDto, IRestockDto, IstockDto, ProductResponse } from '../types/product.type';
import { productService } from '../services/product.service';
import { Prisma, Product } from '../generated/prisma/client';

export const restockProductController = async (req: Request<{ id: string }, {}, IRestockDto>, res: Response<ProductResponse>, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const restockData = req.body;
    const updatedProduct = await productService.restockProduct(productId, restockData);

    res.status(200).json({
        id: updatedProduct.id,
        name: updatedProduct.name,
        currentStock: updatedProduct.currentStock,
        averageCost: Number(updatedProduct.averageCost), 
    });
};


export const getAllProductController = async (req: Request, res: Response<Product[]>, next: NextFunction) => {
    const products = await productService.getAllProduct();

    res.status(200).json(products);
}

export const updateProductController = async (req: Request<{ id: string }, {}, Prisma.ProductUpdateInput>, res: Response<Product>, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const product = await productService.updateProduct(productId,productData);

    res.status(200).json(product);
}

export const createProductController = async (req: Request<{}, {}, ICreateProductDto>, res: Response<Product>, next: NextFunction) => {
    const { barcode, name, description, imageUrl, sellingPrice, categoryId, unitId } = req.body;
    
    const product = await productService.createProduct({
        barcode, 
        name, 
        description, 
        imageUrl, 
        sellingPrice, 
        categoryId,
        unitId,
    });

    res.status(201).json(product);
}

export const updateStockProductController = async (req: Request<{ id: string }, {}, IstockDto>, res: Response<Product>, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const updateStockData = req.body;

    const product = await productService.updateStockProduct(productId , updateStockData);

    res.status(200).json(product);
}