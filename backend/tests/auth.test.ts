import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/config/db.js';
import { cleanupTestUser } from './helpers/auth.helper.js';

afterAll(async () => {
    await cleanupTestUser('jest.user@exemplo.com');
    await prisma.$disconnect();
});

beforeAll(async () => {
    await prisma.user.deleteMany({
        where: { email: 'jest.user@exemplo.com' },
    });
});

describe('Módulo de Autenticação API', () => {

    const testUser = {
        name: 'Usuario Teste Jest',
        email: 'jest.user@exemplo.com',
        password: 'SenhaSegura@123',
    };

    it('Deve cadastrar um novo usuário com sucesso (Status 201)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.email).toBe(testUser.email);

        // Ativa a conta para permitir o teste de login
        await prisma.user.updateMany({
            where: { email: testUser.email },
            data: { isVerified: true },
        });
    });

    it('Deve realizar login e retornar o Cookie HttpOnly de sessão (Status 200)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('Deve solicitar o e-mail de redefinição de senha com sucesso (Status 200)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({
                email: testUser.email,
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    it('Deve recusar cadastro se o e-mail já estiver registrado (Status 400)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('Deve recusar login se a senha estiver incorreta (Status 400)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'senhaIncorreta123',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('Deve recusar verificação com token de e-mail inválido (Status 400)', async () => {
        const res = await request(app)
            .post('/api/auth/verify-email')
            .send({
                token: 'tokenInvalido123',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});