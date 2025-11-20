import { Category, Prisma } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";

export class CategoryRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async createCategory(data: Prisma.CategoryCreateInput, tx?: PrismaTxClient): Promise<Category> {
        return this.getClient(tx).category.create({ data });
    }

    public async findAllCategory(tx?: PrismaTxClient): Promise<Category[]> {
        return this.getClient(tx).category.findMany({});
    }
}