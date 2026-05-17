import { Customer, Prisma } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";
import { CustomerWithRelations } from "../types/customer.type";

export class CustomerRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async findAllCustomer(tx?: PrismaTxClient): Promise<CustomerWithRelations[]> {
        return this.getClient(tx).customer.findMany({
            include: {
                orders: {
                    include: {
                        items: {
                            include: {
                                product: true,
                                sellingUnit: {
                                    include: {
                                        unit: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    public async findCustomer(args: Partial<Customer>, tx?: PrismaTxClient): Promise<Customer | null> {
        const client = tx || prisma;

        const whereInput: Prisma.CustomerWhereInput = {};

        if (args.id) {
            whereInput.id = args.id;
        } else if (args.phoneNumber) {
            whereInput.phoneNumber = args.phoneNumber;
        } else {
            return null;
        }

        return await client.customer.findFirst({
            where: whereInput,
        });
    }

    public async updateCustomer(id: number, data: Prisma.CustomerUpdateInput, tx?: PrismaTxClient): Promise<Customer> {
        return this.getClient(tx).customer.update({
            where: { id },
            data
        });
    }

    public async createCustomer(data: Prisma.CustomerCreateInput, tx?: PrismaTxClient): Promise<Customer> {
        return this.getClient(tx).customer.create({ data });
    }
}