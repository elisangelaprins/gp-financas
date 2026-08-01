import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';

describe('Módulo de Categorias API', () => {

    let authCookie: string[];

    const testUser = {
        name: 'Usuario Categoria Jest',
        email: 'category.jest@exemplo.com',
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

    it('Deve listar as categorias disponíveis (Status 200)', async () => {
        const res = await request(app)
            .get('/api/categories')
            .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

    });

    it('Deve criar uma nova categoria personalizada (Status 201)', async () => {
        const res = await request(app)
            .post('/api/categories')
            .set('Cookie', authCookie)
            .send({
                name: 'Viagens & Lazer',
                icon: 'plane',
                color: '#3B82F6',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Viagens & Lazer');
        
    });

});