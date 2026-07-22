import type { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    //next exige 4 parâmetros, mesmo que não sejam utilizados, para que o express reconheça como middleware de erro
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    const errorStack = err instanceof Error ? err.stack : "";
    console.error(`[Global Error]: ${errorMessage}`, { stack: errorStack }); // Registro do erro no console do servidor
    res.status(500).json({
        message: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
    }); // Registtro de resposta genérica para o cliente
};