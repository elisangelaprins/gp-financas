import type { Request, Response, NextFunction } from 'express';
import { getAuthUserId } from '../utils/auth.utils.js';
import prisma from '../config/db.js';
import type { Prisma, TransactionType, PaymentMethod } from '@prisma/client';
import { createTransactionSchema, updateTransactionSchema } from '../utils/validation.schemas.js';

const VALID_PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BOLETO'];
const VALID_TRANSACTION_TYPES = ['INCOME', 'EXPENSE'];

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const parsed = createTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "Dados inválidos." });
            return;
        }
        const { description, amount, date, paymentMethod, transactionType, categoryId, note, isBusiness, paymentDate, installments } = parsed.data;

        // Valida se a categoria existe e pertence ao usuário autenticado ou se é padrão do sistema
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

        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                description,
                amount,
                date: new Date(date),
                paymentMethod,
                transactionType,
                categoryId,
                note: note || null,
                isBusiness: isBusiness || false,
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                installments: installments || null

            }
        });

        res.status(201).json(transaction);

    } catch (error) {
        next(error);
    }
}

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { startDate, endDate, categoryId, transactionType, paymentMethod, isBusiness, page, limit } = req.query;

        const whereClause: Prisma.TransactionWhereInput = { userId };

        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) whereClause.date.gte = new Date(String(startDate));
            if (endDate) whereClause.date.lte = new Date(String(endDate));
        }

        if (categoryId) whereClause.categoryId = String(categoryId);

        if (transactionType) {
            if (!VALID_TRANSACTION_TYPES.includes(String(transactionType))) {
                res.status(400).json({ error: "Tipo de transação inválido no filtro." });
                return;
            }
            whereClause.transactionType = String(transactionType) as TransactionType;
        }

        if (paymentMethod) {
            if (!VALID_PAYMENT_METHODS.includes(String(paymentMethod))) {
                res.status(400).json({ error: "Método de pagamento inválido no filtro." });
                return;
            }
            whereClause.paymentMethod = String(paymentMethod) as PaymentMethod;
        }

        if (isBusiness !== undefined) {
            whereClause.isBusiness = isBusiness === 'true';
        }

        const DEFAULT_LIMIT = 20;
        const MAX_LIMIT = 100;

        const pageNumber = page !== undefined ? Number(page) : 1;
        const limitNumber = limit !== undefined ? Number(limit) : DEFAULT_LIMIT;

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            res.status(400).json({ error: "O parâmetro 'page' deve ser um número inteiro maior que zero." });
            return;
        }

        if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > MAX_LIMIT) {
            res.status(400).json({ error: `O parâmetro 'limit' deve ser um número inteiro entre 1 e ${MAX_LIMIT}.` });
            return;
        }

        const take = limitNumber;
        const skip = (pageNumber - 1) * limitNumber;

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: {
                category: true
            },
            orderBy: [
                { date: 'desc' },
                { id: 'desc' }
            ],
            skip,
            take
        });

        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
}

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { id } = req.params;
        const parsed = updateTransactionSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.issues[0]?.message || "Dados inválidos." });
            return;
        }
        const { description, note, amount, date, paymentMethod, transactionType, categoryId } = parsed.data;
        const updateData: Prisma.TransactionUncheckedUpdateInput = {};

        if (description) updateData.description = description;

        if (note !== undefined) updateData.note = note;

        if (amount) updateData.amount = amount;

        if (date) updateData.date = new Date(date);

        if (paymentMethod) updateData.paymentMethod = paymentMethod;

        if (transactionType) updateData.transactionType = transactionType;

        if (categoryId) updateData.categoryId = categoryId;

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ error: "Nenhum campo para atualizar." });
            return;
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: String(id)
            }
        });

        if (!transaction) {
            res.status(404).json({ error: "Transação não encontrada." });
            return;
        }

        if (transaction.userId !== userId) {
            res.status(403).json({ error: "Você não tem permissão para atualizar esta transação." });
            return;
        }

        if (categoryId) {
            const category = await prisma.category.findFirst({
                where: {
                    id: categoryId,
                    OR: [
                        { isDefault: true },
                        { userId: userId }
                    ]
                },
            })

            if (!category) {
                res.status(400).json({ error: "Categoria informada é inválida." });
                return;
            }
        }
        const updatedTransaction = await prisma.transaction.update({
            where: {
                id: String(id)
            },
            data: updateData
        });

        return res.status(200).json(updatedTransaction);

    } catch (error) {
        next(error);
    }
}

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { id } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: String(id)
            }
        });

        if (!transaction) {
            res.status(404).json({ error: "Transação não encontrada." });
            return;
        }

        if (transaction.userId !== userId) {
            res.status(403).json({ error: "Você não tem permissão para excluir esta transação." });
            return;
        }

        await prisma.transaction.delete({
            where: {
                id: String(id)
            }
        });

        res.status(200).json({ message: "Transação excluída com sucesso." });

    } catch (error) {
        next(error);
    }
};