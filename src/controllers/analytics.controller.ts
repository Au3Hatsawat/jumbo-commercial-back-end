import { NextFunction, Request, Response } from "express";
import { analyticsService } from "../services/analytics.service";

export const getDashboardSummaryController = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    // รับ query param ?days=7 (default 30)
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

export const getCategoryDistributionController = async (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const data = await analyticsService.getSalesByCategoryDistribution(days);
    res.status(200).json(data);
};