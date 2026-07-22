import type { Request, Response, NextFunction } from "express";
import { Prisma, TransactionType } from "@prisma/client";
import prisma from "../config/db.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

interface DataQueryParams {
    month?: string;
    year?: string;
    startDate?: string;
    endDate?: string;
}

function getDateRange(query: DataQueryParams) {
    const { month, year, startDate, endDate } = query;
    let start: Date;
    let end: Date;

    if (startDate && endDate) {
        start = new Date(String(startDate))
        end = new Date(String(endDate));
    } else {
        const selectedYear = year ? Number(year) : new Date().getFullYear();
        const selectedMonth = month ? Number(month) : new Date().getMonth() + 1;
        start = new Date(selectedYear, selectedMonth - 1, 1);
        end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
    };

    return { start, end };

};

function getWhereCondition(
    userId: string,
    query: DataQueryParams & { isBusiness?: string },
    transactionType?: TransactionType
): Prisma.TransactionWhereInput {
    const { start, end } = getDateRange(query);

    const whereCondition: Prisma.TransactionWhereInput = {
        userId,
        date: { gte: start, lte: end }
    };

    if (transactionType) {
        whereCondition.transactionType = transactionType;
    }

    if (query.isBusiness !== undefined) {
        whereCondition.isBusiness = query.isBusiness === "true";
    }

    return whereCondition;
}



export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const userId = reqAuth.user.id;
        const { start, end } = getDateRange(req.query);
        const whereCondition = getWhereCondition(userId, req.query);

        const summaryGroup = await prisma.transaction.groupBy({
            by: ['transactionType'],
            where: whereCondition,
            _sum: { amount: true },
            _avg: { amount: true }
        });

        const incomeItem = summaryGroup.find(item => item.transactionType === "INCOME");

        const expenseItem = summaryGroup.find(item => item.transactionType === "EXPENSE");

        const totalIncome = incomeItem?._sum.amount || 0;
        const totalExpense = expenseItem?._sum.amount || 0;
        const balance = totalIncome - totalExpense;
        const avgIncome = incomeItem?._avg?.amount || 0;
        const avgExpense = expenseItem?._avg?.amount || 0;

        const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
        const dailyExpenseAverage = totalExpense / daysInPeriod;

        res.status(200).json({ totalIncome, totalExpense, balance, avgIncome, avgExpense, dailyExpenseAverage });

    } catch (error) {
        next(error)
    }
};

export const getByCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const userId = reqAuth.user.id;
        const { transactionType } = req.query;
        const type = (transactionType as string)?.toUpperCase() === "INCOME" ? TransactionType.INCOME : TransactionType.EXPENSE;
        const whereCondition = getWhereCondition(userId, req.query, type);

        const categoryGroup = await prisma.transaction.groupBy({
            by: ['categoryId'],
            where: whereCondition,
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } }
        });

        const categoryIds = categoryGroup.map(item => item.categoryId);
        const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });

        const result = categoryGroup.map(item => {
            const category = categories.find(c => c.id === item.categoryId);

            return {
                categoryId: item.categoryId,
                categoryName: category?.name || "Sem Categoria",
                color: category?.color || "#9CA3AF",
                total: item._sum.amount || 0
            };
        })

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
};

export const getTopExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqAuth = req as AuthRequest;
        const userId = reqAuth.user.id;
        const whereCondition = getWhereCondition(userId, req.query, TransactionType.EXPENSE);

        const topExpenses = await prisma.transaction.findMany({
            where: whereCondition,
            orderBy: { amount: "desc" },
            take: 5,
            include: { category: true }
        });

        res.status(200).json(topExpenses)
    } catch (error) {
        next(error)
    }

};