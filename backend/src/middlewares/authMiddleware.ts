import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}

export const verifyUser = ( req: Request, res: Response, next: NextFunction): void => {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader) {
        res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        return;
    };

    const [scheme, token] = tokenHeader.split(' ');

    if (scheme !== 'Bearer' || !token) { 
        res.status(401).json({ error: "Acesso negado. Token inválido." });
        return;
    };

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        (req as AuthRequest).user = decoded as { id: string; email: string };

        next();

    } catch (error) {
        res.status(401).json({ error: "Acesso negado. Token inválido ou expirado." });
    };
}