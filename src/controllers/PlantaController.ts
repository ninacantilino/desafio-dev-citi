import { Request, Response } from "express";
import { Luminosidade, Prisma } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";
import { isBodyObject, isPostgresInteger, validatePlanta } from "../validators/planta";

const registroInexistente = (error: unknown) =>
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const resultado = validatePlanta(req.body, false);
        if (!resultado.success) {
            return res.status(400).json({ message: resultado.message });
        }
        const planta = await PlantaRepository.createPlanta(resultado.data as Prisma.PlantaCreateInput);

    // 201 Created: algo novo foi criado
    return res.status(201).json(planta);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao criar planta."
        });
    }
};

export const readAllPlantas = async (req: Request, res: Response) => {
  try {
    const { luminosidade, petFriendly } = req.query;
    const petFriendlyBoolean =
    petFriendly === undefined ? undefined : petFriendly === "true";
    if (petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false") {
    return res.status(400).json({
        message: "Filtro petFriendly inválido."
    });
}
    if (
    luminosidade !== undefined &&
    (typeof luminosidade !== "string" ||
    !Object.values(Luminosidade).includes(luminosidade as Luminosidade))
    ) {
    return res.status(400).json({
        message: "Filtro luminosidade inválido."
    });
}
    const plantas = await PlantaRepository.findAllPlantas({
    luminosidade: luminosidade as Luminosidade | undefined,
    petFriendly: petFriendlyBoolean
});

return res.status(200).json(plantas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar plantas." });
  }
};

export const readPlantaById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!isPostgresInteger(id, 1)) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        const planta = await PlantaRepository.findPlantaById(id);

        if (!planta) {
            return res.status(404).json({
                message: "Planta não encontrada."
            });
        }

        return res.status(200).json(planta);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao buscar planta."
        });
    }
};

export const updatePlanta = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!isPostgresInteger(id, 1)) {
        return res.status(400).json({ message: "ID deve ser um inteiro entre 1 e 2147483647." });
    }
    const resultado = validatePlanta(req.body, true);
    if (!resultado.success) {
        return res.status(400).json({ message: resultado.message });
    }
    const updatedPlanta = await PlantaRepository.updatePlanta(id, resultado.data);

    return res.status(200).json(updatedPlanta);
  } catch (error) {
        if (registroInexistente(error)) {
            return res.status(404).json({ message: "Planta não encontrada." });
        }
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        // Validar o ID
        if (!isPostgresInteger(id, 1)) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        // Excluir a planta
        await PlantaRepository.deletePlanta(id);

        return res.status(204).send();

    } catch (error) {
        if (registroInexistente(error)) {
            return res.status(404).json({ message: "Planta não encontrada." });
        }
        console.error(error);
        return res.status(500).json({
            message: "Erro ao deletar planta."
        });
    }
};

export const venderPlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!isBodyObject(req.body)) {
            return res.status(400).json({ message: "O corpo deve ser um objeto JSON." });
        }
        const { quantidade } = req.body;

        if (!isPostgresInteger(id, 1)) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        if (!isPostgresInteger(quantidade, 1)) {
            return res.status(400).json({
                message: "Quantidade deve ser um inteiro entre 1 e 2147483647."
            });
        }

        const resultado = await PlantaRepository.venderPlanta(id, quantidade);
        if (resultado.status === "not_found") {
            return res.status(404).json({ message: "Planta não encontrada." });
        }
        if (resultado.status === "insufficient_stock") {
            return res.status(400).json({ message: "Estoque insuficiente para realizar a venda." });
        }
        return res.status(200).json(resultado.planta);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao vender planta."
        });
    }
};

export const valorTotalEstoque = async (req: Request, res: Response) => {
    try {
        const plantas = await PlantaRepository.buscarDadosEstoque();

        let valorTotalEmCentavos = 0;
        let totalDeVasos = 0;

        for (const planta of plantas) {
        valorTotalEmCentavos += planta.preco * planta.estoque;
        totalDeVasos += planta.estoque;
        }

        return res.status(200).json({
        valorTotalEmCentavos: valorTotalEmCentavos,
        totalDeVasos: totalDeVasos
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao calcular valor do estoque."
        });
    }
};