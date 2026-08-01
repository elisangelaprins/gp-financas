import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';

describe('Módulo de Exportação de Relatórios API', () => {

    let authCookie: string[];

    const testUser = {
        name: 'Usuario Export Jest',
        email: 'export.jest@exemplo.com',
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

    it('Deve exportar relatório financeiro em formato CSV (Status 200)', async () => {
        const res = await request(app)
            .get('/api/export/csv')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('csv');
    
    });

    it('Deve exportar relatório financeiro em formato PDF (Status 200)', async () => {
        const res = await request(app)
            .get('/api/export/pdf')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('pdf');

    });

});