import PDFDocument from 'pdfkit';
import type { TransactionWithCategory } from './csv.utils.js';


/**
 * Gera o buffer binário do relatório em PDF acumulando os pedaços (chunks) de stream do PDFKit.
 */
export const generatePDF = (transactions: TransactionWithCategory[]): Promise<Buffer> => {

    return new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30 });
        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));
        doc.fontSize(18).text('Relatório Financeiro', { align: 'center' });
        doc.moveDown();

        transactions.forEach(( transaction) => {
            const date =  new Date(transaction.date).toLocaleDateString('pt-BR');
            const descricao = transaction.description;
            const categoria = transaction.category.name;
            const valor = `R$ ${transaction.amount.toFixed(2)}`;
            const tipo = transaction.transactionType === 'INCOME' ? 'Receita' : 'Despesa'

            doc.fontSize(10).text(`${date} | ${descricao} | ${categoria} | ${valor} | ${tipo}`);
        });

        doc.end();

    })

}
