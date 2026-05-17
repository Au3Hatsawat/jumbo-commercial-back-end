import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { deleteSellingUnitController, updateSellingUnitController } from "../controllers/product.controller";


const router = Router();

router.patch("/:id" , asyncHandler(updateSellingUnitController));
router.delete("/:id" , asyncHandler(deleteSellingUnitController));

export default router;