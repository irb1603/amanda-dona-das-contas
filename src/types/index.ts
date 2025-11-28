export type TransactionType = 'income' | 'expense';
export type Pilar = 'Despesas Fixas' | 'Investimentos' | 'Guilty-free' | 'Imprevistos';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'transfer';

export interface Category {
    id: string;
    name: string;
    pilar: Pilar;
    color?: string;
    icon?: string;
}

export interface Transaction {
    id?: string;
    description: string;
    amount: number;
    date: Date; // Will be converted to Timestamp in Firestore
    type: TransactionType;
    category: string; // Category ID or Name
    pilar?: Pilar; // Denormalized for easier querying
    paymentMethod: PaymentMethod;
    isFixed: boolean;
    cardSource?: string; // 'BB', 'DUX', 'C6'

    // Installment specific
    installmentIndex?: number; // 1 for 1/10
    totalInstallments?: number; // 10 for 1/10
    parentTransactionId?: string; // ID of the first installment or the "purchase" event

    // Recurring specific
    recurringRuleId?: string;
}

export interface RecurringRule {
    id?: string;
    description: string;
    amount: number;
    category: string;
    pilar: Pilar;
    frequency: 'monthly';
    startDate: Date;
    endDate?: Date; // If null, infinite
    isActive: boolean;
}
