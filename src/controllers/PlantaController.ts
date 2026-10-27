import { Request, Response } from "express";
import { Luminosidade } from "@prisma/client";
import * as PlantaRepository from "@repositories/PlantaRepository";

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const {
            nome,
            especie,
            preco,
            estoque,
            luminosidade,
            petFriendly,
            regaACadaDias
        } = req.body;

        
    if (
        typeof nome !== "string" || nome.trim() === "" ||
        typeof especie !== "string" || especie.trim() === ""
    ) {
        return res.status(400).json({
            message: "Nome e espécie devem ser textos não vazios."
        });
    }

    if (!Number.isInteger(preco) || preco <= 0) {
        return res.status(400).json({
            message: "Preço deve ser um inteiro maior que zero."
        });
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
        return res.status(400).json({
            message: "Estoque deve ser um inteiro não negativo."
        });
    }

    if (!Number.isInteger(regaACadaDias) || regaACadaDias < 1) {
        return res.status(400).json({
            message: "Intervalo de rega deve ser um inteiro de pelo menos 1 dia."
        });
    }

    if (typeof petFriendly !== "boolean") {
        return res.status(400).json({
            message: "petFriendly deve ser booleano."
        });
    }

    if (!Object.values(Luminosidade).includes(luminosidade)) {
        return res.status(400).json({
            message: "Luminosidade inválida."
        });
    }

    const planta = await PlantaRepository.createPlanta({
        nome: nome,
        especie: especie,
        preco: preco,
        estoque: estoque,
        luminosidade: luminosidade,
        petFriendly: petFriendly,
        regaACadaDias: regaACadaDias
    });

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

        if (!Number.isInteger(id) || id <= 0) {
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
    const { nome, especie, preco, estoque, luminosidade, petFriendly, regaACadaDias } = req.body;

    // Antes de editar, garantimos que a planta existe
    // Verificar se o ID é válido
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "ID inválido."
        });
    }

    // Buscar a planta
    const planta = await PlantaRepository.findPlantaById(id);

    // Verificar se ela existe
    if (!planta) {
        return res.status(404).json({
            message: "Planta não encontrada."
        });
    }

        // Validar nome
    if (nome !== undefined &&
        (typeof nome !== "string" || nome.trim() === "")) {
        return res.status(400).json({
            message: "Nome inválido."
        });
    }

    // Validar espécie
    if (especie !== undefined &&
        (typeof especie !== "string" || especie.trim() === "")) {
        return res.status(400).json({
            message: "Espécie inválida."
        });
    }

    // Validar preço
    if (preco !== undefined &&
        (!Number.isInteger(preco) || preco <= 0)) {
        return res.status(400).json({
            message: "Preço inválido."
        });
    }

    // Validar estoque
    if (estoque !== undefined &&
        (!Number.isInteger(estoque) || estoque < 0)) {
        return res.status(400).json({
            message: "Estoque inválido."
        });
    }

    // Validar intervalo de rega
    if (regaACadaDias !== undefined &&
        (!Number.isInteger(regaACadaDias) || regaACadaDias < 1)) {
        return res.status(400).json({
            message: "Intervalo de rega inválido."
        });
    }

    // Validar petFriendly
    if (petFriendly !== undefined &&
        typeof petFriendly !== "boolean") {
        return res.status(400).json({
            message: "petFriendly inválido."
        });
    }

    // Validar luminosidade
    if (luminosidade !== undefined &&
        !Object.values(Luminosidade).includes(luminosidade)) {
        return res.status(400).json({
            message: "Luminosidade inválida."
        });
    }

    // PATCH = atualização parcial: campos não enviados (undefined) não são alterados
    const updatedPlanta = await PlantaRepository.updatePlanta(id, {
        nome: nome,
        especie: especie,
        preco: preco,
        estoque: estoque,
        luminosidade: luminosidade,
        petFriendly: petFriendly,
        regaACadaDias: regaACadaDias
    });

    return res.status(200).json(updatedPlanta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar planta." });
  }
};

export const deletePlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        // Validar o ID
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        // Verificar se a planta existe
        const planta = await PlantaRepository.findPlantaById(id);

        if (!planta) {
            return res.status(404).json({
                message: "Planta não encontrada."
            });
        }

        // Excluir a planta
        await PlantaRepository.deletePlanta(id);

        return res.status(204).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao deletar planta."
        });
    }
};

export const venderPlanta = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { quantidade } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID inválido."
            });
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            return res.status(400).json({
                message: "Quantidade deve ser um inteiro maior que zero."
            });
        }

        const planta = await PlantaRepository.findPlantaById(id);

        if (!planta) {
            return res.status(404).json({
                message: "Planta não encontrada."
            });
        }

        if (planta.estoque < quantidade) {
            return res.status(400).json({
                message: `Estoque insuficiente. Temos apenas ${planta.estoque} vasos.`
            });
        }

        const plantaAtualizada = await PlantaRepository.venderPlanta(id, quantidade);

        return res.status(200).json(plantaAtualizada);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao vender planta."
        });
    }
};