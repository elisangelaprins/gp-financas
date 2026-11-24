import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordReset } from '../services/email.service.js';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../utils/validation.schemas.js';

const FORGOT_PASSWORD_MESSAGE =
    "Se o e-mail informado estiver cadastrado, você receberá em instantes as instruções para redefinir a senha. O link é válido por 10 minutos.";
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('senha-descartavel', 10);

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "Dados inválidos." });
            return;
        }
        const { name, email, password } = parsed.data;

        const userExists = await prisma.user.findUnique({
            where: { email }
        });

        if (userExists) {
            res.status(409).json({ error: "Email já cadastrado." });
            return;
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, 10),
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
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "Email e senha são obrigatórios." });
            return;
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
            res.status(401).json({ error: "Email ou senha incorretos." });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({ error: "Email ou senha incorretos." });
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
        const parsed = forgotPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "O e-mail é obrigatório." });
            return;
        }
        const { email } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(200).json({ message: FORGOT_PASSWORD_MESSAGE });
            return;
        };

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: resetTokenHash,
                resetExpires,
            },
        });

        sendPasswordReset(user.email, resetToken, user.name).catch(err => {
            console.error("[forgot-password] falha ao enviar e-mail:", err);
        });

        res.status(200).json({ message: FORGOT_PASSWORD_MESSAGE });

    } catch (error) {
        next(error);
    }

};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = resetPasswordSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "Token e senha são obrigatórios" });
            return;
        }
        const { resetToken, newPassword } = parsed.data;

        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await prisma.user.findFirst({
            where: {
                resetToken: resetTokenHash
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