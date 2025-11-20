import { Prisma } from "../generated/prisma/client";

export type CustomerWithRelations = Prisma.CustomerGetPayload<{
    include: {
        orders: {
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        }
    }
}>;