import { Router } from 'express';
import productRoute from './product.route';
import orderRoute from './order.route';
import unitRoute from'./unit.route';
import categoryRoute from './category.route';
import customerRoute from './customer.route';
import analyticRoute from './analytics.routes';
import productSellingUnitRoute from './productsellingunit.routes'
import { errorHandler } from '../middlewares/errorHandler.middleware';

const router = Router();

router.use("/products",productRoute);
router.use("/orders",orderRoute);
router.use("/units", unitRoute);
router.use("/categories", categoryRoute);
router.use("/customers", customerRoute);
router.use("/analytics", analyticRoute);
router.use("/selling-units", productSellingUnitRoute);
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.use(errorHandler);

export default router;