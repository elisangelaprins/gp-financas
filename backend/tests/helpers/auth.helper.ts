import request from 'supertest';
import type { Express } from 'express';
import prisma from '../../src/config/db.js';

export interface TestUserContext {
    testUser: {
        name: string;
        email: string;
        senha: string;
    };
    
    authCookie: string[];
}

/**
 * Helper reutilizável para registrar um usuário de teste e retornar o Cookie HttpOnly de sessão.
 */
export async function createTestUserAndLogin(app: Express, emailPrefix: string): Promise<TestUserContext> {
    const email = `${emailPrefix}.${Date.now()}@exemplo.com`;
    const testUser = {
        name: `Usuario Teste ${emailPrefix}`,
        email,
        senha: 'senhaSegura123',
    };

    await prisma.user.deleteMany({ where: { email } });

    await request(app).post('/api/auth/register').send(testUser);

    const loginRes = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        senha: testUser.senha,
    });

    const authCookie = loginRes.headers['set-cookie'] as unknown as string[];

    return { testUser, authCookie };
}

/**
 * Helper de Teardown: Limpa do banco de dados o usuário e todos os registros vinculados a ele.
 */
export async function cleanupTestUser(email: string): Promise<void> {
    
    if (!email || !email.endsWith('@exemplo.com')) return;

    const user = await prisma.user.findFirst({ where: { email } });

    if (user) {
        await prisma.transaction.deleteMany({ where: { userId: user.id } });

        await prisma.budget.deleteMany({ where: { userId: user.id } });

        await prisma.category.deleteMany({ where: { userId: user.id, isDefault: false } });
        
        await prisma.user.delete({ where: { id: user.id } });
    };
};