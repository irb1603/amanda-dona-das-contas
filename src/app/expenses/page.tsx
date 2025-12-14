'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { useSearch } from '@/context/SearchContext';
import { Wallet, Calendar, Loader2, Tag } from 'lucide-react';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import HighlightableText from '@/components/ui/HighlightableText';
import { Transaction } from '@/types';

import { CATEGORIES } from '@/constants';

export default function ExpensesPage() {
    const { selectedDate } = useMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;

    const { transactions, loading } = useTransactions(currentYear, currentMonth);
    const { searchTerm } = useSearch();

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [methodFilter, setMethodFilter] = useState<'all' | 'credit' | 'debit'>('all');

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    // Filter: Expenses that are NOT fixed AND match category filter
    const variableExpenses = transactions.filter((t: Transaction) => {
        if (t.type !== 'expense' || t.isFixed) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (methodFilter === 'credit' && t.paymentMethod !== 'credit_card') return false;
        if (methodFilter === 'debit' && t.paymentMethod !== 'debit_card') return false;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesDescription = t.description.toLowerCase().includes(term);
            const matchesCategory = t.category.toLowerCase().includes(term);
            if (!matchesDescription && !matchesCategory) return false;
        }

        return true;
    });

    const totalVariable = variableExpenses.reduce((acc: number, t: Transaction) => acc + t.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    const sortedCategories = [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Wallet className="text-red-500" />
                    Despesas Variáveis
                </h1>
                <div className="text-right">
                    <p className="text-sm text-slate-600">Total no Mês</p>
                    <p className="text-2xl font-bold text-red-600">
                        {totalVariable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>



            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Method Filter */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg self-start">
                    <button
                        onClick={() => setMethodFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${methodFilter === 'all' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setMethodFilter('credit')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${methodFilter === 'credit' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Crédito
                    </button>
                    <button
                        onClick={() => setMethodFilter('debit')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${methodFilter === 'debit' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Débito
                    </button>
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none bg-white min-w-[200px]"
                >
                    <option value="all">Todas as Categorias</option>
                    {sortedCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-900 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3">Categoria</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variableExpenses.map((t: Transaction) => (
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
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {t.paymentMethod === 'credit_card' ? 'Crédito' : 'Débito'}
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
                            {variableExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                        Nenhuma despesa variável encontrada para este filtro.
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
        </div >
    );
}
