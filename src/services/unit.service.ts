import { Prisma, Unit } from "../generated/prisma/client";
import { prisma } from "../libs/prisma";
import { UnitRepository } from "../repositories/unit.repository";

export class UnitService {
    constructor(private unitRepository: UnitRepository) { }

    public async getAllUnit(): Promise<Unit[]> {
        return await prisma.$transaction(async (tx) => {
            const units = await this.unitRepository.findAllUnit(tx);
            return units;
        })
    }

    public async createUnit(data: Prisma.UnitCreateInput): Promise<Unit> {
        return await prisma.$transaction(async (tx) => {
            const unit = await this.unitRepository.createUnit(data,tx);

            return unit;
        })
    }
}

const unitRepository = new UnitRepository();

export const unitService = new UnitService(unitRepository);