import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index';
import prisma from '../src/config/db.js';

describe('Módulo de transações API', () => {
    let authCookie: string[];
    let categoryId: string;
    let transactionId: string;

    const testUser = {
        name: 'Usuario Transação Jest',
        email: 'transaction.jest@exemplo.com',
        senha: 'senhaSegura123',
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });

        await
            request(app).post('/api/auth/register').send(testUser);

        const loginRes = await
            request(app).post('/api/auth/login').send({
                email: testUser.email,
                senha: testUser.senha,
            });

        authCookie = loginRes.headers['set-cookie'] as unknown as string[];

        let category = await prisma.category.findFirst({
            where: { isDefault: true },
        });

        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: 'Categoria Teste Jest',
                    isDefault: true,
                },
            });
        }
        categoryId = category.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('Deve criar uma receita com sucesso (Status 201)', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Cookie', authCookie)
            .send({
                description: 'Salário Mensal',
                amount: 5000.0,
                date: '2026-07-31T00:00:00.000Z',
                paymentMethod: 'PIX',
                transactionType: 'INCOME',
                categoryId: categoryId,
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        transactionId = res.body.id;
        expect(res.body.amount).toBe(5000.0);

    });

    it('Deve criar uma despesa com sucesso (Status 201)', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Cookie', authCookie)
            .send({
                description: 'Supermercado',
                amount: 250.5,
                date: '2026-07-31T00:00:00.000Z',
                paymentMethod: 'CREDIT_CARD',
                transactionType: 'EXPENSE',
                categoryId: categoryId,
            });

        expect(res.status).toBe(201);
        expect(res.body.transactionType).toBe('EXPENSE');

    });

    it('Deve listar as transações do usuário logado (Status 200)', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

        it('Deve atualizar uma transação existente (Status 200)', async () => {
        const res = await request(app)
            .put(`/api/transactions/${transactionId}`)
            .set('Cookie', authCookie)
            .send({
                description: 'Salário Mensal Reajustado',
                amount: 5500.0,
            });

        expect(res.status).toBe(200);
        expect(res.body.description).toBe('Salário Mensal Reajustado');
        expect(res.body.amount).toBe(5500.0);
        
    });

    it('Deve excluir uma transação existente (Status 200)', async () => {
        const res = await request(app)
            .delete(`/api/transactions/${transactionId}`)
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');

    });

});