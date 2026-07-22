import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';
import prisma from '../config/db.js';
import type { AuthRequest } from '../middlewares/authMiddleware.js';

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const { name, color, isBusiness } = req.body;

        if (!name) {
            res.status(400).json({ error: "O campo 'name' é obrigatório." });
            return;
        }

        const category = await prisma.category.create({
            data: {
                userId: reqAuth.user.id,
                name: name,
                color: color || '#FFFFFF',
                isBusiness: isBusiness || false
            }
        })
        res.status(201).json(category);

    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const { isBusiness } = req.query;
        const whereCondition: Prisma.CategoryWhereInput = {
            OR: [
                { isDefault: true },
                { userId: reqAuth.user.id }
            ]
        };

        if (isBusiness !== undefined) {
            whereCondition.isBusiness = isBusiness === 'true';
        }


        const category = await prisma.category.findMany({
            where: {
                ...whereCondition,

            }
        });
        res.status(200).json(category);
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const { id } = req.params;
        const { name, color, isBusiness } = req.body;
        const updateData: Prisma.CategoryUncheckedUpdateInput = {};

        if (name) updateData.name = name;
        if (color) updateData.color = color;
        if (isBusiness !== undefined) updateData.isBusiness = isBusiness;

        const category = await prisma.category.findUnique({
            where: { id: String(id) }
        });

        if (!category) {
            res.status(404).json({ error: 'Categoria não encontrada.' });
            return;
        };

        if (category.isDefault) {
            res.status(403).json({ error: 'Não é possível atualizar uma categoria padrão.' });
            return;
        };

        if (category.userId !== reqAuth.user.id) {
            res.status(403).json({ error: 'Você não tem permissão para atualizar esta categoria.' });
            return;
        };

        const updateCategory = await prisma.category.update({
            where: {
                id: String(id)
            },
            data: updateData
        });

        return res.status(200).json(updateCategory);

    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id: String(id)}
        })

        if (!category) {
            res.status(404).json({ error: "Categoria não encontrada."});
            return;
        }

        if (category.isDefault) {
            res.status(403).json({ error: "Categorias padrão do sistema não podem ser excluídas."});
            return;
        }

        if (category.userId !== reqAuth.user.id) {
            res.status(403).json({ error: "Você não tem permissão para excluir esta categoria." });
            return;
        }

        await prisma.category.delete({
            where: {
                id: String(id)
            }
        });

        res.status(200).json({ message: "Categoria excluída com sucesso."})

    } catch (error) {
        next(error)
    }
};