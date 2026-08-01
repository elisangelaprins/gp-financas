import PDFDocument from 'pdfkit';
import type { TransactionWithCategory } from './csv.utils.js';

/**
 * Gera o buffer binário do relatório em PDF acumulando os pedaços (chunks) de stream do PDFKit.
 */

const truncateText = (str: string, maxLength: number): string => {
    return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
};

export const generatePDF = (transactions: TransactionWithCategory[]): Promise<Buffer> => {

    return new Promise<Buffer>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        //Cabeçalho Principal
        doc.fillColor('#010508').fontSize(16).text('GP-financas | Extrato Financeiro', 0, 18, { align: 'center', width: 612 });
        doc.moveTo(30, 57).lineTo(582, 57).strokeColor('#CBD5E1').lineWidth(1).stroke();
        const now = `${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        doc.fillColor('#64748B').fontSize(9).text(`Gerado em: ${now}`, 30, 42);
        doc.moveTo(30, 60).lineTo(582, 60).strokeColor('#CBD5E1').lineWidth(0.5).stroke();

        //Cabeçalho 
        let y = 80;
        doc.rect(30, y, 552, 22).fill('#F1F5F9');
        doc.font('Helvetica-Bold').fillColor('#475569').fontSize(9);
        doc.text('DATA', 35, y + 7);
        doc.text('DESCRIÇÃO', 110, y + 7);
        doc.text('CATEGORIA', 270, y + 7);
        doc.text('VALOR', 400, y + 7);
        doc.text('TIPO', 500, y + 7);

        //Linhas
        y += 30;
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('pt-BR');
            const isIncome = transaction.transactionType === "INCOME";

            if (isIncome) totalIncome += transaction.amount;
            else totalExpense += transaction.amount;

            const amountColor = isIncome ? '#15803D' : '#B91C1C';

            doc.font('Helvetica').fillColor('#334155').fontSize(9);
            doc.text(date, 35, y);
            doc.text(truncateText(transaction.description, 22), 110, y);
            doc.text(truncateText(transaction.category.name, 18), 270, y);
            doc.text(`R$ ${transaction.amount.toFixed(2)}`, 400, y);
            doc.fillColor(amountColor).text(isIncome ? 'Receita' : 'Despesa', 500, y);

            y += 20;
            doc.moveTo(30, y - 4).lineTo(582, y - 4).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

            
            if (y > 740) {
                doc.addPage();
                y = 50;
            }
            
        });

        // Resumo Rodapé
        y += 15;

        const balance = totalIncome - totalExpense;
        doc.roundedRect(30, y, 552, 42, 6).fillAndStroke('#F8FAFC', '#CBD5E1');

        doc.font('Helvetica-Bold');

        doc.fillColor('#15803D').fontSize(9).text(`Total Receitas: R$ ${totalIncome.toFixed(2)}`, 45, y + 15);

        doc.fillColor('#B91C1C').fontSize(9).text(`Total Despesas: R$ ${totalExpense.toFixed(2)}`, 225, y + 15);

        doc.fillColor(balance >= 0 ? '#15803D' : '#B91C1C').fontSize(9).text(`Saldo: R$ ${balance.toFixed(2)}`, 435, y + 15);

        doc.end();
    });
};