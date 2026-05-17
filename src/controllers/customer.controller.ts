import { NextFunction, Request, Response } from "express";
import { CustomerWithRelations } from "../types/customer.type";
import { customerService } from "../services/customer.service";
import { Customer, Prisma } from "../generated/prisma/client";

export const getAllCustomerController = async (req: Request, res: Response<CustomerWithRelations[]>, next: NextFunction) => {
    const customers = await customerService.getAllCustomer();
    res.status(200).json(customers);
}

export const getCustomerByIdController = async (req: Request<{id: string}>, res: Response<Customer | null>, next: NextFunction) => {
    const customerId = parseInt(req.params.id);
    const customer = await customerService.getCustomer({ id: customerId });
    res.status(200).json(customer);
}

export const updateCustomerController = async (req: Request<{id: string} , {} , Prisma.CustomerUpdateInput>, res: Response<Customer>, next: NextFunction) => {
    const customerId = parseInt(req.params.id);
    const updateCustomer = req.body;
    const customer = await customerService.updateCustomer(customerId,updateCustomer);
    res.status(200).json(customer);
}

export const createCustomerController = async (req: Request<{} , {} , Prisma.CustomerCreateInput>, res: Response<Customer>, next: NextFunction) => {
    const createCustomer = req.body;
    const customer = await customerService.createCustomer(createCustomer);
    res.status(201).json(customer);
}