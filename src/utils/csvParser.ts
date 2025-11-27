import Papa from 'papaparse';
import { Transaction, Pilar } from '@/types';

// Map CSV columns to internal types
const PILAR_MAP: Record<string, Pilar> = {
    'Despesas Fixas': 'Despesas Fixas',
    'Investimentos': 'Investimentos',
    'Lazer': 'Guilty-free',
    'Imprevistos': 'Imprevistos',
    // Default fallback if not found
};

function parseCurrency(value: string): number {
    // Remove "R$", spaces, dots, and replace comma with dot
    const clean = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

function parseBoolean(value: string): boolean {
    return value?.toUpperCase() === 'SIM';
}

function mapPaymentMethod(value: string): Transaction['paymentMethod'] {
    const v = value?.toUpperCase();
    if (v?.includes('CRÉDITO') || v?.includes('CREDITO')) return 'credit_card';
    if (v?.includes('DÉBITO') || v?.includes('DEBITO')) return 'debit_card';
    if (v?.includes('PIX')) return 'pix';
    if (v?.includes('DINHEIRO')) return 'cash';
    return 'debit_card'; // Default
}

export async function parseTransactionsCSV(file: File): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const transactions: Transaction[] = results.data.map((row: any) => {
                    // CSV Columns: ID,Data,Descrição,Valor,Tipo,Categoria,Subcategoria,Conta,Forma Pagamento,Parcela Atual,Parcela Total,Recorrente,Fixa,Tipo Despesa,Observações

                    const amount = parseCurrency(row['Valor']);
                    const type = row['Tipo'] === 'RECEITA' ? 'income' : 'expense';

                    // Determine Pilar based on some logic or default
                    // Since CSV might not have Pilar explicitly, we might need to infer or set default
                    // For now, let's try to map from Category or set a default
                    let pilar: Pilar = 'Guilty-free'; // Default
                    if (row['Fixa'] === 'SIM') pilar = 'Despesas Fixas';
                    // Add more logic here if needed

                    const transaction: Transaction = {
                        description: row['Descrição'] || 'Sem descrição',
                        amount: amount,
                        date: new Date(row['Data']), // Assuming ISO format from sample
                        type: type,
                        category: row['Categoria'] || 'Outros',
                        pilar: pilar,
                        paymentMethod: mapPaymentMethod(row['Forma Pagamento']),
                        isFixed: parseBoolean(row['Fixa']),
                    };

                    if (row['Parcela Atual']) {
                        transaction.installmentIndex = parseInt(row['Parcela Atual']);
                    }
                    if (row['Parcela Total']) {
                        transaction.totalInstallments = parseInt(row['Parcela Total']);
                    }

                    return transaction;
                });
                resolve(transactions);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}
