import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordReset, sendAccountVerification } from '../services/email.service.js';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {

        if (!req.body.name || !req.body.email || !req.body.password) {
            res.status(400).json({ error: "Todos os campos são obrigatórios." });
            return;
        };

        if (!emailRegex.test(req.body.email)) {
            res.status(400).json({ error: "Formato de e-mail inválido." });
            return;
        };

        if (!passwordRegex.test(req.body.password)) {
            res.status(400).json({ error: "A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial." });
            return;
        };

        const userExists = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (userExists) {
            res.status(400).json({ error: "Email já cadastrado." });
            return;
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: await bcrypt.hash(req.body.password, 10),
                isVerified: false,
                verificationToken,
            },
            select: {
                id: true,
                name: true,
                email: true,
                isVerified: true,
                createdAt: true,
            }

        });

        await sendAccountVerification(user.email, verificationToken, user.name);

        res.status(201).json({ message: "Conta criada com sucesso! Enviamos um e-mail de ativação para o seu endereço.", user });


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

        if (!user.isVerified) {
            res.status(401).json({ error: "Sua conta ainda não foi ativada. Verifique seu e-mail para ativá-la." });
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
            return res.status(200).json({ message: "Se o e-mail estiver cadastrado, enviamos as instruções para redefinição de senha." });
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

        if (!passwordRegex.test(newPassword)) {
            res.status(400).json({ error: "A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial." });
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
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.body;

        if (!token) {
            res.status(400).json({ error: "Token de verificação é obrigatório." });
            return;
        }

        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            res.status(400).json({ error: "Token de verificação inválido ou expirado." });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null
            }
        });

        res.status(200).json({ message: "Conta verificada com sucesso! Você já pode fazer login." });

    } catch (error) {
        next(error);
    }
};