import type { Request } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const getAuthUserId = (req: Request) => {
    const authReq = req as AuthRequest;

    if (!authReq.user?.id){
        throw new Error("Usuário não autenticado.");
    }

    return authReq.user.id;
}