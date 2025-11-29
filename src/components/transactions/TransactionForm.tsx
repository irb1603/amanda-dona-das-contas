'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMonth } from '@/context/MonthContext';
import { CATEGORIES, PILARS } from '@/constants';
import { createInstallmentTransactions, generateRecurringTransactions } from '@/services/transactionService';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Transaction, RecurringRule } from '@/types';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { parseDateStringToLocal, formatDateForInput } from '@/utils/dateUtils';

export default function TransactionForm() {
    const router = useRouter();
    const { selectedDate } = useMonth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [date, setDate] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState(CATEGORIES[0].id);
    const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('credit_card');
    const [cardSource, setCardSource] = useState('Cartão DUX');

    // Complex Logic State
    const [isFixed, setIsFixed] = useState(false);
    const [installments, setInstallments] = useState(1);
    const [isRecurring, setIsRecurring] = useState(false); // For manual recurring setup

    // Set default date to day 01 of the viewed month
    useEffect(() => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1);
        setDate(formatDateForInput(firstDay));
    }, [selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const selectedCategory = CATEGORIES.find(c => c.id === category);
            const pilar = selectedCategory?.pilar || 'Guilty-free';
            const amountValue = amount;

            // Use the selected month from context, NOT the date field
            // The date field is informative only
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const transactionDate = new Date(year, month, 1);

            // Case 1: Credit Card Installments
            if (paymentMethod === 'credit_card' && installments > 1) {
                await createInstallmentTransactions({
                    description,
                    amount: amountValue,
                    date: transactionDate,
                    type,
                    category,
                    pilar,
                    paymentMethod,
                    cardSource: paymentMethod === 'credit_card' ? cardSource : undefined,
                    isFixed: false // Installments usually aren't "fixed" in the recurring sense, but could be. Let's assume false for now or independent.
                }, installments, transactionDate);
            }
            // Case 2: Recurring Rule (Fixed Expense)
            else if (isFixed || isRecurring) {
                const rule: RecurringRule = {
                    description,
                    amount: amountValue,
                    category,
                    pilar,
                    frequency: 'monthly',
                    startDate: transactionDate,
                    isActive: true
                };
                await generateRecurringTransactions(rule);
            }
            // Case 3: Simple Transaction
            else {
                const newTransaction: Transaction = {
                    description,
                    amount: amountValue,
                    date: transactionDate,
                    type,
                    category,
                    pilar,
                    paymentMethod,
                    cardSource: paymentMethod === 'credit_card' ? cardSource : undefined,
                    isFixed: false
                };
                await addDoc(collection(db, 'transactions'), newTransaction);
            }

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error("Error creating transaction:", error);
            alert("Erro ao salvar transação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Nova Transação</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div className="flex gap-4 p-1 bg-slate-100 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Despesa
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Receita
                    </button>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">Descrição</label>
                        <input
                            required
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800 placeholder:text-slate-400"
                            placeholder="Ex: Supermercado"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">Valor (R$)</label>
                        <CurrencyInput
                            value={amount}
                            onChange={setAmount}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800 placeholder:text-slate-400"
                            placeholder="R$ 0,00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">
                            Data da Transação
                            {paymentMethod === 'credit_card' && installments > 1 && (
                                <span className="ml-2 text-xs font-normal text-blue-600">(1ª parcela)</span>
                            )}
                        </label>
                        <input
                            required
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                        />
                        {paymentMethod === 'credit_card' && installments > 1 && (
                            <p className="text-xs text-slate-500">
                                As parcelas seguintes serão criadas nos meses seguintes a partir desta data
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-800"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({cat.pilar})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Forma de Pagamento</label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: 'Cartão de crédito DUX', method: 'credit_card', source: 'Cartão DUX' },
                            { label: 'Cartão de crédito C6', method: 'credit_card', source: 'Cartão C6' },
                            { label: 'Cartão de crédito BB', method: 'credit_card', source: 'Cartão BB' },
                            { label: 'Débito', method: 'debit_card', source: undefined },
                        ].map((option) => {
                            const isSelected = paymentMethod === option.method && (option.method !== 'credit_card' || cardSource === option.source);
                            return (
                                <button
                                    key={option.label}
                                    type="button"
                                    onClick={() => {
                                        setPaymentMethod(option.method as any);
                                        if (option.source) setCardSource(option.source);
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isSelected
                                        ? 'bg-slate-900 text-white border-slate-900'
                                        : 'bg-white text-slate-700 font-medium border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Conditional: Installments */}
                {paymentMethod === 'credit_card' && (
                    <div className="space-y-4">
                        {/* Card Source Selection Removed - Integrated above */}

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-indigo-900">Parcelamento</label>
                                <span className="text-xs text-indigo-600 font-medium">{installments}x de R$ {(amount / installments).toFixed(2)}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="24"
                                value={installments}
                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-indigo-400">
                                <span>À vista</span>
                                <span>12x</span>
                                <span>24x</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conditional: Recurring / Fixed */}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isFixed}
                            onChange={(e) => setIsFixed(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-800 font-bold">É Despesa Fixa? (Recorrente)</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Salvar Transação
                </button>
            </form>
        </div>
    );
}
