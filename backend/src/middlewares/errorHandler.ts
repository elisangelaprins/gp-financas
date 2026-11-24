import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    //next exige 4 parâmetros, mesmo que não sejam utilizados, para que o express reconheça como middleware de erro
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2023') {
        res.status(400).json({
            error: "Formato de ID inválido."
        });
        return;
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        res.status(400).json({
            error: "Dados de entrada inválidos."
        });
        return;
    }

    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    const errorStack = err instanceof Error ? err.stack : "";
    console.error(`[Global Error]: ${errorMessage}`, { stack: errorStack }); // Registro do erro no console do servidor
    res.status(500).json({
        message: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
    }); // Registro de resposta genérica para o cliente
};