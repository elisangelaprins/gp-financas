import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import prisma from './config/db.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimitMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import exportRoutes from './routes/exportRoutes.js'



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', apiLimiter, transactionRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes)
app.use('/api/budgets', apiLimiter, budgetRoutes);
app.use('/api/export', apiLimiter, exportRoutes);

app.get('/', async (req, res) => {
  try {
    await prisma.user.findFirst();
    res.json({ message: "Servidor rodando e conectado ao MongoDB Atlas com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com o banco de dados.", details: error });
  }
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
  });
}

export default app;
