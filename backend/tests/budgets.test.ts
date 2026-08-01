import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';
import { createTestUserAndLogin, cleanupTestUser } from './helpers/auth.helper.js';

describe('Módulo de Orçamentos API', () => {

    let authCookie: string[];
    let categoryId: string;
    let userEmail: string;
    let budgetId: string;

    beforeAll(async () => {
        const context = await createTestUserAndLogin(app, 'budget');
        authCookie = context.authCookie;
        userEmail = context.testUser.email;
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
        await cleanupTestUser(userEmail);
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
        budgetId = res.body.id;
        expect(res.body.amountLimit).toBe(1500.0);

    });

    it('Deve recusar a criação de orçamento duplicado no mesmo mês (Status 409)', async () => {
        const res = await request(app)
            .post('/api/budgets')
            .set('Cookie', authCookie)
            .send({
                amountLimit: 2000.0,
                month: 7,
                year: 2026,
                categoryId: categoryId,
            });

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('message');

    });

    it('Deve listar os orçamentos do mês (Status 200)', async () => {
        const res = await request(app)
            .get('/api/budgets?month=7&year=2026')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

    it('Deve atualizar o limite de um orçamento existente (Status 200)', async () => {
        const res = await request(app)
            .put(`/api/budgets/${budgetId}`)
            .set('Cookie', authCookie)
            .send({ amountLimit: 2500.0 });

        expect(res.status).toBe(200);
        expect(res.body.amountLimit).toBe(2500.0);

    });

    it('Deve excluir um orçamento existente (Status 200)', async () => {
        const res = await request(app)
            .delete(`/api/budgets/${budgetId}`)
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        
    });

});