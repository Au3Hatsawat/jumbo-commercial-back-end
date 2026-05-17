import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { createUnitController, deleteUnitController, getAllUnitController, getByUnitIdController, updateUnitController } from "../controllers/unit.controller";


const router = Router();

router.get('/' , asyncHandler(getAllUnitController));
router.get('/:id', asyncHandler(getByUnitIdController));
router.post('/' , asyncHandler(createUnitController));
router.patch('/:id', asyncHandler(updateUnitController));
router.delete('/:id', asyncHandler((deleteUnitController)));


export default router;