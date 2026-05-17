import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { createCategoryController, deleteCategoryController, getAllCategoryController, getCategoryByIdController, updateCategoryController } from "../controllers/category.controller";

const router = Router();

router.get('/' , asyncHandler(getAllCategoryController));
router.get('/:id', asyncHandler(getCategoryByIdController));
router.post('/' , asyncHandler(createCategoryController));
router.patch('/:id', asyncHandler((updateCategoryController)));
router.delete('/:id', asyncHandler((deleteCategoryController)));

export default router;