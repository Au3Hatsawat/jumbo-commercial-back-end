import { Request, Response, NextFunction } from 'express';
import { IAddSellingUnitDto, ICreateProductDto, IRestockDto, IstockDto, ProductResponse } from '../types/product.type';
import { productService } from '../services/product.service';
import { Prisma } from '../generated/prisma/client';
import fs from 'fs';
import path from 'node:path';

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

export const getAllProductController = async (req: Request, res: Response, next: NextFunction) => {
    const products = await productService.getAllProduct();
    res.status(200).json(products);
}

export const getProductByIdController = async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const product = await productService.getProductById(productId);
    res.status(200).json(product);
}

export const updateProductController = async (req: Request<{ id: string }, {}, Prisma.ProductUpdateInput>, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const product = await productService.updateProduct(productId, productData);
    res.status(200).json(product);
}

export const createProductController = async (req: Request<{}, {}, ICreateProductDto>, res: Response, next: NextFunction) => {
    const { name, categoryId, baseUnitId, description, imageUrl, sellingUnits } = req.body;

    const product = await productService.createProduct({
        name,
        categoryId,
        baseUnitId,
        description,
        imageUrl,
        sellingUnits
    });

    res.status(201).json(product);
}

export const updateStockProductController = async (req: Request<{ id: string }, {}, IstockDto>, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);
    const updateStockData = req.body;

    const product = await productService.updateStockProduct(productId, updateStockData);

    res.status(200).json(product);
}

export const uploadProductImageController = async (req: Request, res: Response, next: NextFunction) => {
    const productId = parseInt(req.params.id);

    const productSellingUnitId = req.query.productSellingUnitId as string;
    const action = req.query.action as string;

    if (req.file) {

        if (action === "1") {
            const fileUrl = `/uploads/products/${req.file.filename}`;

            const product = await productService.getProductById(productId);
            if (product && product.imageUrl) {
                const parsedUrl = new URL(product.imageUrl);
                const imagePath = parsedUrl.pathname;

                const oldFilePath = path.join(process.cwd(), 'public', imagePath);

                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            await productService.updateProduct(productId, {
                imageUrl: fileUrl
            });
        } else if (action === "2" && productSellingUnitId && productSellingUnitId !== "") {
            const fileUrl = `/uploads/selling-options/${req.file.filename}`;

            const id = parseInt(productSellingUnitId);
            const productSellingUnit = await productService.getProductSellingUnitById(id);
            if (productSellingUnit && productSellingUnit.imageUrl) {
                const parsedUrl = new URL(productSellingUnit.imageUrl);
                const imagePath = parsedUrl.pathname;

                const oldFilePath = path.join(process.cwd(), 'public', imagePath);

                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            await productService.updateSellingUnit(id, {
                imageUrl: fileUrl
            });
        }
    }

    res.status(200).json({
        message: 'อัปโหลดรูปภาพสำเร็จ'
    });
}

export const addSellingUnitController = async (
    req: Request<{ id: string }, {}, IAddSellingUnitDto>,
    res: Response,
    next: NextFunction
) => {
    const productId = parseInt(req.params.id);
    const sellingUnitData = req.body;

    const newSellingUnit = await productService.addSellingUnit(productId, sellingUnitData);

    res.status(201).json(newSellingUnit);
};

export const updateSellingUnitController = async (req: Request<{ id: string }, {}, Prisma.ProductSellingUnitUpdateInput>, res: Response, next: NextFunction) => {
    const productSellingUnitId = parseInt(req.params.id);
    const sellingUnitData = req.body;

    const sellingUnit = await productService.updateSellingUnit(productSellingUnitId, sellingUnitData);

    res.status(200).json(sellingUnit);
}

export const deleteSellingUnitController = async (req: Request<{id: string} , {} ,{}>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);

    const sellingUnit = await productService.deleteProductSellingUnit(id);

    res.status(200).json(sellingUnit);
}