import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        if (!req.body.name || !req.body.email || !req.body.senha) {
            res.status(400).json({ error: "Todos os campos são obrigatórios." });
            return;
        }

        const userExists = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (userExists) {
            res.status(400).json({ error: "Email já cadastrado." });
            return;
        }

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.senha, 10),
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        res.status(201).json(user);


    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.body.email || !req.body.senha) {
            res.status(400).json({ error: "Email e senha são obrigatórios." });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (!user) {
            res.status(400).json({ error: "Email ou senha incorretos." });
            return;
        }

        const isMatch = await bcrypt.compare(req.body.senha, user.password);

        if (!isMatch) {
            res.status(400).json({ error: "Email ou senha incorretos." });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        res.json({ 
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }
         });

    } catch (error) {
        next(error);
    }
}
