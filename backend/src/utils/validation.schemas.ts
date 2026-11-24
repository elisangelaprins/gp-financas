import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_ERROR_MSG =
    "A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.";

export const registerSchema = z.object({
    name: z.string({ message: "Todos os campos são obrigatórios." }).min(1, "Todos os campos são obrigatórios."),
    email: z.string({ message: "Todos os campos são obrigatórios." }).email("Formato de e-mail inválido."),
    password: z.string({ message: "Todos os campos são obrigatórios." }).regex(passwordRegex, PASSWORD_ERROR_MSG),
});

export const loginSchema = z.object({
    email: z.string({ message: "Email e senha são obrigatórios." }).min(1, "Email e senha são obrigatórios."),
    password: z.string({ message: "Email e senha são obrigatórios." }).min(1, "Email e senha são obrigatórios."),
});

export const forgotPasswordSchema = z.object({
    email: z.string({ message: "O e-mail é obrigatório." }).min(1, "O e-mail é obrigatório."),
});

export const resetPasswordSchema = z.object({
    resetToken: z.string({ message: "Token e senha são obrigatórios" }).min(1, "Token e senha são obrigatórios"),
    newPassword: z.string({ message: "Token e senha são obrigatórios" }).regex(passwordRegex, PASSWORD_ERROR_MSG),
});

export const createTransactionSchema = z.object({
    description: z.string({ message: "Todos os campos são obrigatórios." }).min(1, "Todos os campos são obrigatórios."),
    amount: z.coerce.number({ message: "O valor da transação deve ser maior que zero." }).positive("O valor da transação deve ser maior que zero."),
    date: z.string({ message: "Todos os campos são obrigatórios." }).min(1, "Todos os campos são obrigatórios."),
    paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BOLETO'], {
        message: "Método de pagamento ou tipo de transação inválido.",
    }),
    transactionType: z.enum(['INCOME', 'EXPENSE'], {
        message: "Método de pagamento ou tipo de transação inválido.",
    }),
    categoryId: z.string({ message: "Todos os campos são obrigatórios." }).min(1, "Todos os campos são obrigatórios."),
    note: z.string().nullable().optional(),
    isBusiness: z.boolean().optional(),
    paymentDate: z.string().nullable().optional(),
    installments: z.number().int().positive().nullable().optional(),
});

export const createCategorySchema = z.object({
    name: z.string({ message: "O campo 'name' é obrigatório." }).min(1, "O campo 'name' é obrigatório."),
    color: z.string().optional(),
    isBusiness: z.boolean().optional(),
});

export const createBudgetSchema = z.object({
    categoryId: z.string({ message: "Por favor, preencha todos os campos obrigatórios: categoria, limite, mês e ano." }).min(1, "Por favor, preencha todos os campos obrigatórios: categoria, limite, mês e ano."),
    amountLimit: z.coerce.number({ message: "O limite do orçamento deve ser maior que zero." }).positive("O limite do orçamento deve ser maior que zero."),
    month: z.coerce.number({ message: "O mês deve ser um valor inteiro entre 1 e 12." }).int("O mês deve ser um valor inteiro entre 1 e 12.").min(1, "O mês deve ser um valor inteiro entre 1 e 12.").max(12, "O mês deve ser um valor inteiro entre 1 e 12."),
    year: z.coerce.number({ message: "Por favor, preencha todos os campos obrigatórios: categoria, limite, mês e ano." }).int("Por favor, preencha todos os campos obrigatórios: categoria, limite, mês e ano."),
    description: z.string().nullable().optional(),
});
