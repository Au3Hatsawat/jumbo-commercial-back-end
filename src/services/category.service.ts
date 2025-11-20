import { Category, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { CategoryRepository } from "../repositories/category.repositoy";

export class CategoryService {
    constructor(private categoryRepository: CategoryRepository) { }

    public async getAllCategory(): Promise<Category[]> {
        return await prisma.$transaction(async (tx) => {
            const categories = await this.categoryRepository.findAllCategory(tx);
            return categories;
        })
    }

    public async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
        return await prisma.$transaction(async (tx) => {
            const category = await this.categoryRepository.createCategory(data, tx);

            return category;
        })
    }
}

const categoryRepository = new CategoryRepository();

export const categoryService = new CategoryService(categoryRepository);