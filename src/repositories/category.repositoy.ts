import { Category, Prisma } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";

export class CategoryRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async createCategory(data: Prisma.CategoryCreateInput, tx?: PrismaTxClient): Promise<Category> {
        return this.getClient(tx).category.create({ data });
    }

    public async findAllCategory(args: Partial<Category>, tx?: PrismaTxClient): Promise<Category[]> {
        const query: Prisma.CategoryWhereInput = {};

        if (args.isDeleted !== undefined) {
            query.isDeleted = args.isDeleted;
        }

        return this.getClient(tx).category.findMany({
            where: query
        });
    }

    public async findCategoryById(args: Partial<Category>, tx?: PrismaTxClient): Promise<Category> {
         const query: Prisma.CategoryWhereUniqueInput = {
                id: args.id
         };

        if (args.isDeleted !== undefined) {
            query.isDeleted = args.isDeleted;
        }
       
        return this.getClient(tx).category.findUniqueOrThrow({
            where: query
        })
    }

    public async updateCategory(id: number, data: Prisma.CategoryUpdateInput, tx?: PrismaTxClient): Promise<Category> {
        return this.getClient(tx).category.update({
            where: { id },
            data
        })
    }

    public async deleteCategory(id: number, tx?: PrismaTxClient): Promise<Category> {
        return this.getClient(tx).category.delete({
            where: { id }
        })
    }
}