import type { Request, Response, NextFunction } from "express";
import { getAuthUserId } from "../utils/auth.utils.js";
import type { Prisma } from '@prisma/client';
import prisma from "../config/db.js";

export const createBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { amountLimit, month, year, categoryId } = req.body;

        if (!categoryId || !amountLimit || !month || !year) {
            res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios: categoria, limite, mês e ano." });
            return;
        }

        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                OR: [
                    { isDefault: true },
                    { userId: userId }
                ]
            }
        });

        if (!category) {
            res.status(404).json({ message: "Categoria não encontrada ou inválida." });
            return;
        }

        const existingBudget = await prisma.budget.findFirst({
            where: {
                userId,
                categoryId,
                month: Number(month),
                year: Number(year)
            }
        });

        if (existingBudget) {
            res.status(409).json({ message: "Já existe um orçamento para esta categoria neste período. Deseja atualizá-lo?" });
            return;
        }

        const budget = await prisma.budget.create({
            data: {
                userId: userId,
                amountLimit,
                categoryId,
                month: Number(month),
                year: Number(year)
            }
        });

        res.status(201).json(budget);

    } catch (error) {
        next(error)
    }
};

export const getBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { month, year } = req.query;
        const selectedYear = year ? Number(year) : new Date().getFullYear();
        const selectedMonth = month ? Number(month) : new Date().getMonth() + 1;
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

        const transactionWhere: Prisma.TransactionWhereInput = {
            userId,
            transactionType: "EXPENSE",
            date: { gte: startDate, lte: endDate }
        };

        if (req.query.isBusiness !== undefined) {
            transactionWhere.isBusiness = req.query.isBusiness === "true";
        }

        const expensesGroup = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: transactionWhere,
            _sum: { amount: true }
        });

        const budgets = await prisma.budget.findMany({
            where: {
                userId: userId,
                month: selectedMonth,
                year: selectedYear
            },
            include: {
                category: true
            }
        });

        const result = budgets.map(budget => {
            const expense = expensesGroup.find(e => e.categoryId === budget.categoryId);
            const spent = expense?._sum.amount || 0;
            const remaining = budget.amountLimit - spent;
            const percentageSpent = budget.amountLimit > 0
                ? Number(((spent / budget.amountLimit) * 100).toFixed(2))
                : 0;

            return {
                id: budget.id,
                amountLimit: budget.amountLimit,
                spent,
                remaining,
                percentageSpent,
                month: budget.month,
                year: budget.year,
                category: budget.category
            };
        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

export const updateBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { id } = req.params;
        const { amountLimit } = req.body;

        const existingBudget = await prisma.budget.findFirst({
            where: { id: String(id), userId }
        });

        if (!existingBudget) {
            res.status(404).json({ message: "Orçamento não encontrado." })
            return;
        }

        const updateBudget = await prisma.budget.update({
            where: {
                id: String(id)
            }, 
            data: {
                amountLimit: Number(amountLimit)
            }
        });

        res.status(200).json(updateBudget);

    } catch (error) {
        next(error);
    }
};

export const deleteBudget = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { id } = req.params;

        const budget = await prisma.budget.findUnique({
            where: { id: String(id) }
        })

        if (!budget) {
            res.status(404).json({ message: "Orçamento não encontrado."} )
            return;
        };

        if (budget.userId !== userId) {
            res.status(403).json({ error: "Você não tem permissão para excluir este orçamento." });
            return;
        }

        await prisma.budget.delete({
            where: {
                id: String(id)
            }
        });

        res.status(200).json({ message: "Orçamento excluído com sucesso." })

    } catch (error) {
        next(error)
    }
};