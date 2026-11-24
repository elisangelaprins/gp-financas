import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import crypto from 'crypto';
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

    it('Deve realizar login, retornar o Cookie HttpOnly de sessão e permitir logout (Status 200)', async () => {

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password,
            });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();

        const logoutRes = await request(app).post('/api/auth/logout');
        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body).toHaveProperty('message', 'Logout realizado com sucesso.');
        expect(String(logoutRes.headers['set-cookie'])).toContain('token=;');
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

    it('Deve recusar cadastro se o e-mail já estiver registrado (Status 409)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty('error');
    });

    it('Deve recusar login se a senha estiver incorreta (Status 401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'senhaIncorreta123',
            });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('Deve redefinir a senha com sucesso quando o token for válido (Status 200)', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        await prisma.user.update({
            where: { email: testUser.email },
            data: {
                resetToken: hashedToken,
                resetExpires: new Date(Date.now() + 10 * 60 * 1000),
            },
        });

        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({
                resetToken: rawToken,
                newPassword: 'NovaSenhaSegura@123',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Senha atualizada com sucesso');

        const updatedUser = await prisma.user.findUnique({ where: { email: testUser.email } });
        expect(updatedUser?.resetToken).toBeNull();
        expect(updatedUser?.resetExpires).toBeNull();
    });

    it('Deve recusar redefinição de senha quando o token estiver expirado (Status 400)', async () => {
        const expiredRawToken = crypto.randomBytes(32).toString('hex');
        const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');

        await prisma.user.update({
            where: { email: testUser.email },
            data: {
                resetToken: expiredHash,
                resetExpires: new Date(Date.now() - 60 * 1000),
            },
        });

        const res = await request(app)
            .post('/api/auth/reset-password')
            .send({
                resetToken: expiredRawToken,
                newPassword: 'OutraSenhaSegura@123',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Dados inválidos ou expirados');
    });

});