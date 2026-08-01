import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';
import { createTestUserAndLogin, cleanupTestUser } from './helpers/auth.helper.js';

describe('Módulo do Dashboard API', () => {

    let authCookie: string[];
    let userEmail: string;

    beforeAll(async () => {
        const context = await createTestUserAndLogin(app, 'dashboard');

        authCookie = context.authCookie;
        userEmail = context.testUser.email;
    });

    afterAll(async () => {
        await cleanupTestUser(userEmail);
        await prisma.$disconnect();
    });

    it('Deve retornar o resumo financeiro (Status 200)', async () => {
        const res = await request(app)
            .get('/api/dashboard/summary')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('totalIncome');
        expect(res.body).toHaveProperty('totalExpense');
        expect(res.body).toHaveProperty('balance');

    });

    it('Deve retornar os gastos por categoria (Status 200)', async () => {
        const res = await request(app)
            .get('/api/dashboard/by-category')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

    it('Deve retornar a evolução mensal dos últimos 6 meses (Status 200)', async () => {
        const res = await request(app)
            .get('/api/dashboard/monthly-trend')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

    it('Deve negar acesso se o usuário não estiver autenticado (Status 401)', async () => {
        const res = await request(app).get('/api/dashboard/summary');
        
        expect(res.status).toBe(401);
    });

});