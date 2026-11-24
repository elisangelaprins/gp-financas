import 'dotenv/config';
import prisma from '../src/config/db.js';

const DEFAULT_CATEGORIES = [
    { name: 'Alimentação', color: '#EF4444', isBusiness: false },
    { name: 'Moradia', color: '#F59E0B', isBusiness: false },
    { name: 'Transporte', color: '#06B6D4', isBusiness: false },
    { name: 'Saúde', color: '#EC4899', isBusiness: false },
    { name: 'Lazer', color: '#8B5CF6', isBusiness: false },
    { name: 'Salário', color: '#22C55E', isBusiness: false },
    { name: 'Trabalho', color: '#10B981', isBusiness: true },
    { name: 'Tecnologia', color: '#3B82F6', isBusiness: true },
];

const TEST_CATEGORY_NAMES = [
    'Categoria Teste Jest',
    'Categoria Test Jest',
    'Categoria Padrão Jest',
    'Categoria Orçamento Jest',
];

async function main() {
    // 1. Remove usuário de teste da demo ao vivo (se existir)
    const demoTestUser = await prisma.user.findUnique({
        where: { email: 'teste.render.live@exemplo.com' },
    });
    if (demoTestUser) {
        await prisma.transaction.deleteMany({ where: { userId: demoTestUser.id } });
        await prisma.budget.deleteMany({ where: { userId: demoTestUser.id } });
        await prisma.category.deleteMany({ where: { userId: demoTestUser.id, isDefault: false } });
        await prisma.user.delete({ where: { id: demoTestUser.id } });
    }

    // 2. Limpa categorias residuais de testes antigos (removendo vínculos órfãos antes, se houver)
    const testCategories = await prisma.category.findMany({
        where: { name: { in: TEST_CATEGORY_NAMES } },
    });

    if (testCategories.length > 0) {
        const testCatIds = testCategories.map((c) => c.id);
        await prisma.transaction.deleteMany({ where: { categoryId: { in: testCatIds } } });
        await prisma.budget.deleteMany({ where: { categoryId: { in: testCatIds } } });
        await prisma.category.deleteMany({ where: { id: { in: testCatIds } } });
    }

    // 3. Cria ou atualiza as categorias padrão do sistema (convergência garantida)
    for (const cat of DEFAULT_CATEGORIES) {
        const existing = await prisma.category.findFirst({
            where: { name: cat.name, isDefault: true },
        });

        if (!existing) {
            await prisma.category.create({
                data: {
                    name: cat.name,
                    color: cat.color,
                    isDefault: true,
                    isBusiness: cat.isBusiness,
                },
            });
        } else {
            await prisma.category.update({
                where: { id: existing.id },
                data: {
                    color: cat.color,
                    isBusiness: cat.isBusiness,
                },
            });
        }
    }

    console.log('✅ Seed de categorias padrão concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
