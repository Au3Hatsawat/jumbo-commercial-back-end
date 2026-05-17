import { Customer, Prisma } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerWithRelations } from "../types/customer.type";
import { AppError } from "../utils/errutils/appError";

export class CustomerService {
    constructor(private customerRepository: CustomerRepository) { }

    public async getAllCustomer(): Promise<CustomerWithRelations[]> {
        return await prisma.$transaction(async (tx) => {
            const customers = await this.customerRepository.findAllCustomer(tx);
            return customers;
        })
    }

    public async getCustomer(args: Partial<Customer>): Promise<Customer | null> {
        return await prisma.$transaction(async (tx) => {
            const customer = await this.customerRepository.findCustomer(args, tx);
            return customer;
        })
    }

    public async updateCustomer(id: number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
        return await prisma.$transaction(async (tx) => {
            const phoneToCheck = typeof data.phoneNumber === 'string'
                ? data.phoneNumber
                : data.phoneNumber?.set;

            if (phoneToCheck) {
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(phoneToCheck)) {
                    throw new AppError('CU000000');
                }
            }

            const customer = await this.customerRepository.updateCustomer(id, data, tx);
            return customer;
        })
    }

    public async createCustomer(data: Prisma.CustomerCreateInput): Promise<Customer> {
        return await prisma.$transaction(async (tx) => {
            const phoneToCheck = data.phoneNumber;

            if (phoneToCheck) {
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(phoneToCheck)) {
                    throw new AppError('CU000100');
                }
            }

            const customer = await this.customerRepository.createCustomer(data, tx);
            return customer;
        })
    }
}

const customerRepository = new CustomerRepository();

export const customerService = new CustomerService(customerRepository);