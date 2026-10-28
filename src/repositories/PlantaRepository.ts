import { Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
    return await prisma.planta.create({
        data: data,
    });
};

export const findAllPlantas = async (filtros: Prisma.PlantaWhereInput) => {
    return await prisma.planta.findMany({
        where: filtros
    });
};

export const findPlantaById = async (id: number) => {
    return await prisma.planta.findUnique({
        where: { id: id }
    });
};

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
    return await prisma.planta.update({
        where: { id: id },
        data: data,
    });
};

export const deletePlanta = async (id: number) => {
    return await prisma.planta.delete({
        where: { id: id }
    });
};

export const venderPlanta = async (id: number, quantidade: number) => {
    return prisma.$transaction(async transaction => {
        // A atualização condicional bloqueia a linha até o fim da transação.
        const resultado = await transaction.planta.updateMany({
            where: { id, estoque: { gte: quantidade } },
            data: { estoque: { decrement: quantidade } }
        });
        const planta = await transaction.planta.findUnique({ where: { id } });
        if (!planta) return { status: "not_found" as const };
        if (resultado.count === 0) return { status: "insufficient_stock" as const };
        return { status: "sold" as const, planta };
    });
};

export const buscarDadosEstoque = async () => {
    return await prisma.planta.findMany({
        select: {
            preco: true,
            estoque: true
        }
    });
};