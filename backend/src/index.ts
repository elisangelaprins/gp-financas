import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes)
// Rota de teste inicial (Health Check)
app.get('/', async (req, res) => {
  try {
    // Testa a conexão básica com o banco buscando um usuário (deve retornar vazio, mas sem erro)
    await prisma.user.findFirst();
    res.json({ message: "Servidor rodando e conectado ao MongoDB Atlas com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com o banco de dados.", details: error });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});


