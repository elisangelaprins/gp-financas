export interface TransactionWithCategory {
    description: string;
    note?: string | null;
    amount: number;
    date: Date;
    paymentDate?: Date | null;
    paymentMethod: string;
    installments?: number | null;
    transactionType: string;
    isBusiness: boolean;
    category: {
        name: string;
    };
};

interface Column {
    title: string;
    getItem: (transaction: TransactionWithCategory) => any;
}

export const generateCSV = (transactions: TransactionWithCategory[]): string => {
    const columns: Column[] = [
        { title: "Data de Compra", getItem: t => new Date(t.date).toLocaleDateString('pt-BR') },
        { title: "Descrição", getItem: t => t.description },
        { title: "Categoria", getItem: t => t.category.name },
        { title: "Valor", getItem: t => t.amount },
        { title: "Tipo", getItem: t => t.transactionType === "INCOME" ? "Receita" : "Despesa" },
        { title: "Perfil", getItem: t => t.isBusiness ? "PJ" : "PF" },
        { title: "Forma de Pagamento", getItem: t => t.paymentMethod },
        { title: "Parcelas", getItem: t => t.installments ? `${t.installments}X` : "À vista" },
        { title: "Data de pagamento", getItem: t => t.paymentDate ? new Date(t.paymentDate).toLocaleDateString('pt-BR') : "Pendente" },
        { title: "Observação", getItem: t => t.note ?? "" },
    ]

    const header = columns.map(col => col.title).join("|");
    const rows = transactions.map(t => columns.map(col => col.getItem(t)).join("|"));

    // Adiciona BOM UTF-8 para garantir acentuação correta no Microsoft Excel
    return "\uFEFF" + [header, ...rows].join("\n");
}