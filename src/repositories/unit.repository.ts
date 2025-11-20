import { Prisma, Unit } from "../generated/prisma/client";
import { prisma, PrismaTxClient } from "../libs/prisma";

export class UnitRepository {
    private getClient(tx?: PrismaTxClient) {
        return tx || prisma;
    }

    public async createUnit(data:Prisma.UnitCreateInput , tx?: PrismaTxClient): Promise<Unit> {
        return this.getClient(tx).unit.create({data});
    }

    public async findAllUnit(tx?: PrismaTxClient): Promise<Unit[]> {
        return this.getClient(tx).unit.findMany({});
    }
}