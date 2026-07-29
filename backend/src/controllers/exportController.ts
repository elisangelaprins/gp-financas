import type { Request, Response, NextFunction } from "express";
import prisma from "../config/db.js";
import { getAuthUserId } from "../utils/auth.utils.js";
import { generateCSV } from "../utils/csv.utils.js";

export const exportCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuthUserId(req);

        const transactions = await prisma.transaction.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { date: 'desc' }
        });

        const csv = generateCSV(transactions);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
        res.status(200).send(csv);

    } catch (error) {
        next(error)
    }
};