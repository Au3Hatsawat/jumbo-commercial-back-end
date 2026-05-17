import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createOrderController, exportOrdersExcelController, generateReceiptController, getAllOrderController } from '../controllers/order.controller';

const router = Router();

router.get('/', asyncHandler(getAllOrderController));
router.get('/export', asyncHandler(exportOrdersExcelController));
router.post('/', asyncHandler(createOrderController)); 
router.get('/:id/receipt', asyncHandler(generateReceiptController));

export default router;