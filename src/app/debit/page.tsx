'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { Loader2, TrendingDown, Tag, Calendar } from 'lucide-react';
import HighlightableText from '@/components/ui/HighlightableText';
import { Transaction } from '@/types';

export default function DebitPage() {
    const { selectedDate } = useMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;

    const { transactions, loading } = useTransactions(currentYear, currentMonth);

    // Filter Debit Transactions
    const debitTransactions = transactions.filter((t: Transaction) => t.paymentMethod === 'debit_card');
    const totalDebit = debitTransactions.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Transações no Débito</h1>
                <p className="text-slate-500">Acompanhe seus gastos no débito deste mês</p>
            </div>

            {/* Total Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 font-medium mb-1">Total no Débito</p>
                <h3 className="text-3xl font-bold text-slate-800">
                    {totalDebit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h3>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Histórico</h3>
                </div>

                <div className="divide-y divide-slate-100">
                    {debitTransactions.length > 0 ? (
                        debitTransactions.map((t: Transaction) => (
                            <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                        <TrendingDown size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{t.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Tag size={12} /> {t.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {t.date.toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600">
                                        - {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Nenhuma transação no débito encontrada para este mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
