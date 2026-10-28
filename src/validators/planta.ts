import { Luminosidade } from "@prisma/client";

type PlantaData = {
    nome: string;
    especie: string;
    preco: number;
    estoque: number;
    luminosidade: Luminosidade;
    petFriendly: boolean;
    regaACadaDias: number;
};

type ValidationResult =
    | { success: true; data: Partial<PlantaData> }
    | { success: false; message: string };

export const isPostgresInteger = (value: unknown, minimum: number): value is number =>
    typeof value === "number" && Number.isSafeInteger(value) &&
    value >= minimum && value <= 2147483647;

export const isBodyObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const rules: { [K in keyof PlantaData]: { valid: (value: unknown) => boolean; message: string } } = {
    nome: { valid: value => typeof value === "string" && value.trim() !== "", message: "Nome deve ser um texto não vazio." },
    especie: { valid: value => typeof value === "string" && value.trim() !== "", message: "Espécie deve ser um texto não vazio." },
    preco: { valid: value => isPostgresInteger(value, 1), message: "Preço deve ser um inteiro entre 1 e 2147483647, em centavos." },
    estoque: { valid: value => isPostgresInteger(value, 0), message: "Estoque deve ser um inteiro entre 0 e 2147483647." },
    regaACadaDias: { valid: value => isPostgresInteger(value, 1), message: "Intervalo de rega deve ser um inteiro entre 1 e 2147483647 dias." },
    petFriendly: { valid: value => typeof value === "boolean", message: "petFriendly deve ser booleano." },
    luminosidade: { valid: value => typeof value === "string" && Object.values(Luminosidade).includes(value as Luminosidade), message: "Luminosidade deve ser SOMBRA, MEIA_SOMBRA ou SOL_PLENO." }
};

export const validatePlanta = (body: unknown, partial: boolean): ValidationResult => {
    if (!isBodyObject(body)) {
        return { success: false, message: "O corpo deve ser um objeto JSON." };
    }
    const data: Record<string, unknown> = {};
    for (const field of Object.keys(rules) as (keyof PlantaData)[]) {
        if (partial && !Object.prototype.hasOwnProperty.call(body, field)) continue;
        const rule = rules[field];
        if (!rule.valid(body[field])) return { success: false, message: rule.message };
        data[field] = body[field];
    }
    return { success: true, data: data as Partial<PlantaData> };
};
