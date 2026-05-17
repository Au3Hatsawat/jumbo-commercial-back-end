import { NextFunction, Request, Response } from "express";
import { Category, Prisma } from "../generated/prisma/client";
import { categoryService } from "../services/category.service";

export const getAllCategoryController = async (req: Request, res: Response<Category[]>, next: NextFunction) => {
    const categories = await categoryService.getAllCategory();
    res.status(200).json(categories);
}

export const getCategoryByIdController = async (req: Request<{id:string},{},{}>, res: Response<Category>, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(id);

    res.status(200).json(category);
}

export const createCategoryController = async (req: Request<{} , {} , Prisma.CategoryCreateInput>, res: Response<Category>, next: NextFunction) => {
    const categoryData = req.body;
    const category = await categoryService.createCategory(categoryData);

    res.status(201).json(category);
}

export const updateCategoryController = async (req: Request<{id: string}, {}, Prisma.CategoryUpdateInput> , res: Response<Category>, next: NextFunction) => {
    const data = req.body;
    const id = parseInt(req.params.id);

    const category = await categoryService.updateCategory(id , data);

    res.status(200).json(category);
}

export const deleteCategoryController = async (req: Request<{id: string} , {} , {}> , res: Response<Category>, next: NextFunction) => {
    const id = parseInt(req.params.id);

    const category = await categoryService.deleteCategory(id);

    res.status(200).json(category);
}