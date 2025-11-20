import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { createCategoryController, getAllCategoryController } from "../controllers/category.controller";

const router = Router();

router.get('/' , asyncHandler(getAllCategoryController));
router.post('/' , asyncHandler(createCategoryController));

export default router;