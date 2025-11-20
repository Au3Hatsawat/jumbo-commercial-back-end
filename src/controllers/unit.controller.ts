import { NextFunction, Request, Response } from "express";
import { Prisma, Unit } from "../generated/prisma/client";
import { unitService } from "../services/unit.service";

export const getAllUnitController = async (req: Request, res: Response<Unit[]>, next: NextFunction) => {
    const units = await unitService.getAllUnit();

    res.status(200).json(units);
}

export const createUnitController = async (req: Request<{} , {} , Prisma.UnitCreateInput>, res: Response<Unit>, next: NextFunction) => {
    const unitData = req.body;
    const unit = await unitService.createUnit(unitData);

    res.status(201).json(unit);
}