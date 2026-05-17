import { NextFunction, Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";

export const getDashboardSummaryController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const data = await analyticsService.getDashboardSummary(days);
    res.status(200).json(data);
};

export const getTopProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data = await analyticsService.getTopProducts();
    res.status(200).json(data);
};

export const getCategoryDistributionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const lang = req.headers['accept-language'] || 'th';
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const data = await analyticsService.getSalesByCategoryDistribution(lang, days);
    res.status(200).json(data);
};

export const getPaymentMethodDistributionController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const lang = req.headers['accept-language'] || 'th';
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const data = await analyticsService.getPaymentMethodDistribution(lang, days);
    res.status(200).json(data);
};

export const getTopCustomersController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const data = await analyticsService.getTopCustomers();
    res.status(200).json(data);
};