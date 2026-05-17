import { Router } from 'express';
import asyncHandler from 'express-async-handler'; 
import { addSellingUnitController, createProductController, getAllProductController, getProductByIdController, restockProductController, updateProductController, updateStockProductController, uploadProductImageController  } from '../controllers/product.controller';
import { uploadProductImage } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', asyncHandler(getAllProductController));
router.get('/:id',asyncHandler(getProductByIdController));
router.post('/', asyncHandler(createProductController));
router.post('/:id/selling-units',asyncHandler(addSellingUnitController))
router.post('/:id/restock', asyncHandler(restockProductController));
router.post('/:id/upload', uploadProductImage.single('image'), asyncHandler(uploadProductImageController))
router.patch('/:id', asyncHandler(updateProductController));
router.patch('/:id/stock', asyncHandler(updateStockProductController));

export default router;