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
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe(testUser.email);

    });

    it('Deve realizar login e retornar e Cookie HttpOnly de sessão(Status 200)', async () => {

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
        expect(res.body).toHaveProperty(
            'message',
            'Se o e-mail informado estiver cadastrado, você receberá em instantes as instruções para redefinir a senha. O link é válido por 10 minutos.'
        );
    });

    it('Deve responder igual para e-mail não cadastrado (anti user enumeration)', async () => {
        const existente = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: testUser.email });

        const inexistente = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nao.existe.jest@exemplo.com' });

        expect(inexistente.status).toBe(existente.status);
        expect(inexistente.body).toEqual(existente.body);
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

});