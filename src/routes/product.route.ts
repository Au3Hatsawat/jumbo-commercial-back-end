import { Router } from 'express';
import asyncHandler from 'express-async-handler'; 
import { createProductController, getAllProductController, restockProductController, updateProductController, updateStockProductController  } from '../controllers/product.controller';

const router = Router();

router.get('/', asyncHandler(getAllProductController));
router.post('/', asyncHandler(createProductController));
router.patch('/:id', asyncHandler(updateProductController));
router.post('/:id/restock', asyncHandler(restockProductController));
router.patch('/:id/stock', asyncHandler(updateStockProductController));

export default router;