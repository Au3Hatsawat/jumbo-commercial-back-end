import { Prisma } from "../generated/prisma/client";

export interface TopProductResult {
  productId: number;
  productName: string;
  _sum: {
    quantity: number | null; 
    totalPrice: Prisma.Decimal | null;
  };
}

export interface CategorySalesResult {
    categoryId: number;
    _sum: {
        totalPrice: Prisma.Decimal | null;
    };
}