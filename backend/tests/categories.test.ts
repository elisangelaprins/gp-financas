import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';
import { createTestUserAndLogin, cleanupTestUser } from './helpers/auth.helper.js';

describe('Módulo de Categorias API', () => {

    let authCookie: string[];
    let userEmail: string;
    let defaultCategoryId: string;

    beforeAll(async () => {
        const context = await createTestUserAndLogin(app, 'category');
        authCookie = context.authCookie;
        userEmail = context.testUser.email;

        let defaultCategory = await prisma.category.findFirst({ where: { isDefault: true } });
        if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
                data: { name: 'Categoria Padrão Jest', isDefault: true },
            });
        }
        defaultCategoryId = defaultCategory.id;
    });

    afterAll(async () => {
        await cleanupTestUser(userEmail);
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
                color: '#3B82F6',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Viagens & Lazer');

    });

    it('Deve recusar a exclusão de uma categoria padrão do sistema (Status 403)', async () => {
        const res = await request(app)
            .delete(`/api/categories/${defaultCategoryId}`)
            .set('Cookie', authCookie);

        expect(res.status).toBe(403);
    });

});