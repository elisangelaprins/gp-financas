import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

export const verifyUser = ( req: Request, res: Response, next: NextFunction): void => {

    // Recupera o token diretamente dos cookies (injetados pelo cookie-parser).
    const token = req.cookies?.token;

    if (!token) {
        res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        return;
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        (req as AuthRequest).user = decoded as { id: string; email: string };

        next();

    } catch {
        res.status(401).json({ error: "Acesso negado. Token inválido ou expirado." });
    };
}