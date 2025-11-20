import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { createUnitController, getAllUnitController } from "../controllers/unit.controller";


const router = Router();

router.get('/' , asyncHandler(getAllUnitController));
router.post('/' , asyncHandler(createUnitController));


export default router;