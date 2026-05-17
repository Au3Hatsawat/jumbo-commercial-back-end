import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getCategoryDistributionController, getDashboardSummaryController, getPaymentMethodDistributionController, getTopCustomersController, getTopProductsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/summary', asyncHandler(getDashboardSummaryController));
router.get('/category-distribution', asyncHandler(getCategoryDistributionController));
router.get('/top-products', asyncHandler(getTopProductsController));
router.get('/payment-distribution', asyncHandler(getPaymentMethodDistributionController));
router.get('/top-customers', asyncHandler(getTopCustomersController));

export default router;