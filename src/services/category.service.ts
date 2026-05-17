import { Category, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { CategoryRepository } from "../repositories/category.repositoy";

export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) { }

    public async getAllCategory(): Promise<Category[]> {
        return await prisma.$transaction(async (tx) => {
            const categories = await this.categoryRepository.findAllCategory({ isDeleted: false }, tx);
            return categories;
        })
    }

    public async getCategoryById(id: number): Promise<Category> {
        return await prisma.$transaction(async (tx) => {
            const category = await this.categoryRepository.findCategoryById({ id, isDeleted: false }, tx);
            return category;
        })
    }

    public async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
        return await prisma.$transaction(async (tx) => {
            const category = await this.categoryRepository.createCategory(data, tx);

            return category;
        })
    }

    public async updateCategory(id: number, data: Prisma.CategoryUpdateInput): Promise<Category> {
        return await prisma.$transaction(async (tx) => {
            const category = await this.categoryRepository.updateCategory(id, data, tx);

            return category;
        })
    }

    public async deleteCategory(id: number): Promise<Category> {
        return await prisma.$transaction(async (tx) => {
            const category = await this.categoryRepository.updateCategory(id,{
                isDeleted: true,
                deletedAt: new Date()
            }, tx);
            return category;
        })
    }
}

const categoryRepository = new CategoryRepository();

export const categoryService = new CategoryService(categoryRepository);