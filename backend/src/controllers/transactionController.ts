import type { Request, Response, NextFunction } from 'express';    
import { getAuthUserId } from '../utils/auth.utils.js';
import prisma from '../config/db.js';
import type { Prisma } from '@prisma/client';

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const userId = getAuthUserId(req);
        const { description, amount, date, paymentMethod, transactionType, categoryId } = req.body;

        if (!description || !amount || !date || !paymentMethod || !transactionType || !categoryId) {
            res.status(400).json({ error: "Todos os campos são obrigatórios." });
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
                categoryId
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
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: userId
            },
            include: {
                category: true
            }
        });

        res.status(200).json(transactions);
    } catch (error) {
        next(error);
    }
}

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const { id } =  req.params;
        const { description, note, amount, date, paymentMethod, transactionType, categoryId } = req.body;
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