import { PrismaClient } from "../generated/prisma/client"; // path ตามที่คุณ config ใน schema

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export type PrismaTxClient = Omit<
    typeof prisma,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends" 
>;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;