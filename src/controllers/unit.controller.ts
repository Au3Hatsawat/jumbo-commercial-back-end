import { NextFunction, Request, Response } from "express";
import { Prisma, Unit } from "../generated/prisma/client";
import { unitService } from "../services/unit.service";

export const getAllUnitController = async (req: Request, res: Response<Unit[]>, next: NextFunction) => {
    const units = await unitService.getAllUnit();

    res.status(200).json(units);
}

export const getByUnitIdController = async (req: Request<{id:string},{},{}>, res: Response<Unit>, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const unit = await unitService.getUnitById(id);

    res.status(200).json(unit);
}

export const createUnitController = async (req: Request<{} , {} , Prisma.UnitCreateInput>, res: Response<Unit>, next: NextFunction) => {
    const unitData = req.body;
    const unit = await unitService.createUnit(unitData);

    res.status(201).json(unit);
}

export const updateUnitController = async (req: Request<{id: string}, {}, Prisma.UnitUpdateInput> , res: Response<Unit>, next: NextFunction) => {
    const data = req.body;
    const id = parseInt(req.params.id);

    const unit = await unitService.updateUnit(id , data);

    res.status(200).json(unit);
}

export const deleteUnitController = async (req: Request<{id: string} , {} , {}> , res: Response<Unit>, next: NextFunction) => {
    const id = parseInt(req.params.id);

    const unit = await unitService.deleteUnit(id);

    res.status(200).json(unit);
}