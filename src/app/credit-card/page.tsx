'use client';

import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { useSearch } from '@/context/SearchContext';
import { CreditCard, Calendar, Loader2 } from 'lucide-react';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import HighlightableText from '@/components/ui/HighlightableText';
import { Transaction } from '@/types';

import { CATEGORIES } from '@/constants';

export default function CreditCardPage() {
    const { selectedDate } = useMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;

    const { transactions, loading } = useTransactions(currentYear, currentMonth);
    const { searchTerm } = useSearch();

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Cartão DUX' | 'Cartão C6' | 'Cartão BB'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'fixed' | 'variable'>('all');

    const handleTransactionClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const creditTransactions = transactions.filter((t: Transaction) => {
        if (t.paymentMethod !== 'credit_card') return false;
        if (filter !== 'all' && t.cardSource !== filter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (typeFilter === 'fixed' && !t.isFixed) return false;
        if (typeFilter === 'variable' && t.isFixed) return false;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matchesDescription = t.description.toLowerCase().includes(term);
            const matchesCategory = t.category.toLowerCase().includes(term);
            if (!matchesDescription && !matchesCategory) return false;
        }

        return true;
    });

    const totalInvoice = creditTransactions.reduce((acc: number, t: Transaction) => acc + t.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    // Get unique categories present in credit card transactions for the filter dropdown
    // Or just show all categories? Showing all is safer/easier.
    // Let's show all categories sorted alphabetically.
    const sortedCategories = [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="text-indigo-600" />
                    Cartão de Crédito
                </h1>
                <div className="text-right">
                    <p className="text-sm text-slate-600">Fatura Estimada</p>
                    <p className="text-2xl font-bold text-indigo-700">
                        {totalInvoice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Card Source Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                    {[
                        { id: 'all', label: 'Todos' },
                        { id: 'Cartão DUX', label: 'DUX' },
                        { id: 'Cartão C6', label: 'C6' },
                        { id: 'Cartão BB', label: 'BB' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setFilter(opt.id as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === opt.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Type Filter (Fixed/Variable) */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg self-start">
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setTypeFilter('fixed')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === 'fixed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Fixas
                    </button>
                    <button
                        onClick={() => setTypeFilter('variable')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === 'variable' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Avulsas
                    </button>
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none bg-white min-w-[200px]"
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
                                <th className="px-4 py-3">Cartão</th>
                                <th className="px-4 py-3">Categoria</th>
                                <th className="px-4 py-3">Parcela</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {creditTransactions.map((t: Transaction) => (
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
                                        {t.cardSource?.replace('Cartão ', '') || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {t.category}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 font-medium">
                                        {t.totalInstallments ? `${t.installmentIndex}/${t.totalInstallments}` : 'À vista'}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            ))}
                            {creditTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Nenhuma compra encontrada para este filtro.
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
