import type { Request, Response, NextFunction } from "express";
import type { Prisma, TransactionType, PaymentMethod } from "@prisma/client";
import prisma from "../config/db.js";
import { getAuthUserId } from "../utils/auth.utils.js";
import { generateCSV } from "../utils/csv.utils.js";
import { generatePDF } from "../utils/pdf.utils.js";

const buildTransactionWhere = (userId: string, query: Record<string, unknown>): Prisma.TransactionWhereInput => {
    const whereClause: Prisma.TransactionWhereInput = { userId };
    const { startDate, endDate, categoryId, transactionType, paymentMethod } = query;

    if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) whereClause.date.gte = new Date(startDate as string);
        if (endDate) whereClause.date.lte = new Date(endDate as string);
    };

    if (categoryId) whereClause.categoryId = String(categoryId);

    if (transactionType) whereClause.transactionType = transactionType as TransactionType;

    if (paymentMethod) whereClause.paymentMethod = paymentMethod as PaymentMethod;

    if (query.isBusiness !== undefined) {
        whereClause.isBusiness = query.isBusiness === 'true';
    }

    return whereClause;
};

export const exportCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);
        const whereClause = buildTransactionWhere(userId, req.query);

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: { date: 'desc' }
        });

        const csv = generateCSV(transactions);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        res.status(200).send(csv);

    } catch (error) {
        next(error)
    }
};

export const exportPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);

        const whereClause = buildTransactionWhere(userId, req.query);

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: { date: 'desc' }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="transacoes.pdf"');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');


        const pdf = await generatePDF(transactions);
        res.status(200).send(pdf)
    } catch (error) {
        next(error)
    }
}