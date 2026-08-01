import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordReset } from '../services/email.service.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        if (!req.body.name || !req.body.email || !req.body.password) {
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
                password: await bcrypt.hash(req.body.password, 10),
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
        if (!req.body.email || !req.body.password) {
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

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            res.status(400).json({ error: "Email ou senha incorretos." });
            return;
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );
        // Armazena o JWT em cookie HTTP-Only para proteção contra vulnerabilidades XSS e CSRF
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite:  process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3600000
        })

        //JSON final de resposta contendo apenas o objeto do usuário (sem o token!)
        res.json({
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email
            }
        });

    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ error: "O e-mail é obrigatório." });
            return;
        };

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(200).json({ message: "Se o e-mail estiver cadastrado, enviamos as instruções para redefinição de senha."  });
            return;
        };

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetExpires,
            },
        });

        await sendPasswordReset(user.email, resetToken, user.name);

        res.json({ message: "Email de redefinição enviado com sucesso." });

    } catch (error) {
        next(error);
    }

};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            res.status(400).json({ error: "Token e senha são obrigatórios" });
            return;
        };

        const user = await prisma.user.findFirst({
            where: {
                resetToken
            }
        });

        if (!user || !user.resetExpires || user.resetExpires < new Date()) {
            return res.status(400).json({ message: "Dados inválidos ou expirados" })
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetExpires: null
            },
        });

        return res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        next(error)
    }
}