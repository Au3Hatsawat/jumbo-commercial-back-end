import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { createCustomerController, getAllCustomerController, getCustomerByIdController, updateCustomerController } from "../controllers/customer.controller";

const router = Router();

router.get('/', asyncHandler(getAllCustomerController));
router.get('/:id', asyncHandler(getCustomerByIdController));
router.post('/', asyncHandler(createCustomerController));
router.patch('/:id', asyncHandler(updateCustomerController));

export default router;
