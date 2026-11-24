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

    it('Deve recusar orçamento com limite negativo ou mês inválido (Status 400)', async () => {
        const resNegative = await request(app)
            .post('/api/budgets')
            .set('Cookie', authCookie)
            .send({
                amountLimit: -500,
                month: 7,
                year: 2026,
                categoryId: categoryId,
            });

        expect(resNegative.status).toBe(400);

        const resInvalidMonth = await request(app)
            .post('/api/budgets')
            .set('Cookie', authCookie)
            .send({
                amountLimit: 1000,
                month: 13,
                year: 2026,
                categoryId: categoryId,
            });

        expect(resInvalidMonth.status).toBe(400);
    });

    it('Não deve permitir que o Usuário A leia, edite ou exclua orçamento do Usuário B (Status 403)', async () => {
        const userB = await createTestUserAndLogin(app, 'budget.userb');

        try {
            const createRes = await request(app)
                .post('/api/budgets')
                .set('Cookie', userB.authCookie)
                .send({
                    amountLimit: 1800,
                    month: 8,
                    year: 2026,
                    categoryId: categoryId,
                });

            const budgetUserBId = createRes.body.id;

            const listRes = await request(app)
                .get('/api/budgets?month=8&year=2026')
                .set('Cookie', authCookie);
            expect(listRes.body.some((b: { id: string }) => b.id === budgetUserBId)).toBe(false);

            const updateRes = await request(app)
                .put(`/api/budgets/${budgetUserBId}`)
                .set('Cookie', authCookie)
                .send({ amountLimit: 9999 });
            expect(updateRes.status).toBe(403);

            const deleteRes = await request(app)
                .delete(`/api/budgets/${budgetUserBId}`)
                .set('Cookie', authCookie);
            expect(deleteRes.status).toBe(403);
        } finally {
            await cleanupTestUser(userB.testUser.email);
        }
    });

});