import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';

describe('Módulo de Orçamentos API', () => {

    let authCookie: string[];
    let categoryId: string;

    const testUser = {
        name: 'Usuario Orcamento Jest',
        email: 'budget.jest@exemplo.com',
        senha: 'senhaSegura123',
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });

        await request(app).post('/api/auth/register').send(testUser);

        const loginRes = await request(app).post('/api/auth/login').send({
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
                    name: 'Categoria Orçamento Jest',
                    isDefault: true,
                },
            });
        }
        categoryId = category.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('Deve definir/criar um orçamento mensal com sucesso (Status 201)', async () => {
        const res = await request(app)
            .post('/api/budgets')
            .set('Cookie', authCookie)
            .send({
                amountLimit: 1500.0,
                month: 7,
                year: 2026,
                categoryId: categoryId,
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.amountLimit).toBe(1500.0);

    });

    it('Deve listar os orçamentos do mês (Status 200)', async () => {
        const res = await request(app)
            .get('/api/budgets?month=7&year=2026')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

});