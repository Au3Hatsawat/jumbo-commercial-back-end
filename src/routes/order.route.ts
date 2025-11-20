import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createOrderController, exportOrdersExcelController, getAllOrderController } from '../controllers/order.controller';

const router = Router();

router.get('/', asyncHandler(getAllOrderController));
router.get('/export', asyncHandler(exportOrdersExcelController));
router.post('/', asyncHandler(createOrderController)); 

export default router;