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
        return this.getClient(tx).unit.findMany({
            where: {
                isDeleted: false
            }
        });
    }

    public async findUnitById(id:number, tx?: PrismaTxClient): Promise<Unit> {
        return this.getClient(tx).unit.findUniqueOrThrow({
            where: {
                id,
                isDeleted: false
            }
        })
    }

    public async updateUnit(id: number,data:Prisma.UnitUpdateInput, tx?: PrismaTxClient): Promise<Unit> {
        return this.getClient(tx).unit.update({
            where: {id},
            data
        })
    }

    public async deleteUnit(id: number, tx?: PrismaTxClient): Promise<Unit> {
        return this.getClient(tx).unit.delete({
            where: {id}
        })
    }
}