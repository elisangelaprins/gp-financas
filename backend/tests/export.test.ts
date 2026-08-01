import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';
import { createTestUserAndLogin, cleanupTestUser } from './helpers/auth.helper.js';

describe('Módulo de Exportação de Relatórios API', () => {

    let authCookie: string[];
    let userEmail: string;

    beforeAll(async () => {
        const context = await createTestUserAndLogin(app, 'export');

        authCookie = context.authCookie;
        userEmail = context.testUser.email;
    });

    afterAll(async () => {
        await cleanupTestUser(userEmail);
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

    it('Deve negar acesso se o usuário não estiver autenticado (Status 401)', async () => {
        const res = await request(app).get('/api/export/csv');

        expect(res.status).toBe(401);
    });

    it('Deve negar acesso ao PDF se o usuário não estiver autenticado (Status 401)', async () => {
        const res = await request(app).get('/api/export/pdf');

        expect(res.status).toBe(401);
    });

    it('Deve exportar relatório PDF aplicando filtros de busca (Status 200)', async () => {
        const res = await request(app)
            .get('/api/export/pdf?transactionType=EXPENSE&startDate=2026-01-01&isBusiness=true')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('pdf');

    });

        it('Deve exportar relatório CSV aplicando filtros de busca (Status 200)', async () => {
        const res = await request(app)
            .get('/api/export/csv?transactionType=EXPENSE&startDate=2026-01-01&isBusiness=true')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toContain('csv');
        
    });

});