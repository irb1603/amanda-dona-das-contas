'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { Repeat, Calendar, Loader2, Tag } from 'lucide-react';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import HighlightableText from '@/components/ui/HighlightableText';
import { Transaction } from '@/types';

export default function RecurringPage() {
    const { selectedDate } = useMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;

    const { transactions, loading } = useTransactions(currentYear, currentMonth);

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    // Filter: Expenses that ARE fixed
    const fixedExpenses = transactions.filter(t => t.type === 'expense' && t.isFixed);
    const totalFixed = fixedExpenses.reduce((acc, t) => acc + t.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Repeat className="text-blue-500" />
                    Despesas Fixas
                </h1>
                <div className="text-right">
                    <p className="text-sm text-slate-600">Total no Mês</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {totalFixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Categoria</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fixedExpenses.map((t) => (
                                <tr
                                    key={t.id}
                                    onClick={() => handleTransactionClick(t)}
                                    className="border-b border-slate-50 last:border-none hover:bg-slate-50 cursor-pointer"
                                >
                                    <td className="px-4 py-3 flex items-center gap-2 font-medium text-slate-700">
                                        <Calendar size={14} className="text-slate-500" />
                                        {t.date.toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">
                                        <HighlightableText text={t.description} />
                                    </td>
                                    <td className="px-4 py-3 flex items-center gap-2 text-slate-700 font-medium">
                                        <Tag size={14} />
                                        <HighlightableText text={t.category} />
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            ))}
                            {fixedExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                        Nenhuma despesa fixa neste mês.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditTransactionModal
                transaction={selectedTransaction}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={() => { }}
            />
        </div>
    );
}
