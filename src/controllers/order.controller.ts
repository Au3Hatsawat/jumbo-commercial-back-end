import { NextFunction, Request, Response } from "express";
import { ICreateOrderDto, OrderWithRelations } from "../types/order.type";
import { orderService } from "../services/order.service";

export const createOrderController = async (
    req: Request<{}, {}, ICreateOrderDto>,
    res: Response<OrderWithRelations>,
    next: NextFunction
) => {
    const orderData: ICreateOrderDto = req.body;
    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
};

export const getAllOrderController = async (req: Request, res: Response<OrderWithRelations[]>, next: NextFunction) => {
    const orders = await orderService.getAllOrder();
    res.status(200).json(orders);
}

export const exportOrdersExcelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { startDate, endDate } = req.query;

    const buffer = await orderService.exportOrdersToExcel(
        startDate as string,
        endDate as string
    );

    const fileName = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.send(buffer);
};