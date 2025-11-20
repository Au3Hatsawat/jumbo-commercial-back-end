import { NextFunction, Request, Response } from "express";
import { Category, Prisma } from "../generated/prisma/client";
import { categoryService } from "../services/category.service";

export const getAllCategoryController = async (req: Request, res: Response<Category[]>, next: NextFunction) => {
    const categories = await categoryService.getAllCategory();
    res.status(200).json(categories);
}

export const createCategoryController = async (req: Request<{} , {} , Prisma.CategoryCreateInput>, res: Response<Category>, next: NextFunction) => {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json(category);
}