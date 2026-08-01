import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';

describe('Módulo do Dashboard API', () => {

    let authCookie: string[];

    const testUser = {
        name: 'Usuario Dashboard Jest',
        email: 'dashboard.jest@exemplo.com',
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
    });

    afterAll(async () => {
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

});