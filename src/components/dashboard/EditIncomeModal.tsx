'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, TrendingUp, Plus, Trash2, Edit2 } from 'lucide-react';
import { collection, addDoc, Timestamp, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { Transaction } from '@/types';

interface EditIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentIncome: number;
    currentYear: number;
    currentMonth: number;
}

export default function EditIncomeModal({ isOpen, onClose, currentIncome, currentYear, currentMonth }: EditIncomeModalProps) {
    const [incomeTransactions, setIncomeTransactions] = useState<(Transaction & { id: string })[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState(0);
    const [editDescription, setEditDescription] = useState('');
    const [addingNew, setAddingNew] = useState(false);
    const [newAmount, setNewAmount] = useState(0);
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadIncomeTransactions();
        }
    }, [isOpen, currentYear, currentMonth]);

    const loadIncomeTransactions = async () => {
        setLoading(true);
        try {
            const startDate = new Date(currentYear, currentMonth - 1, 1);
            const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

            const q = query(
                collection(db, 'transactions'),
                where('type', '==', 'income'),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate))
            );

            const snapshot = await getDocs(q);
            const transactions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate()
            })) as (Transaction & { id: string })[];

            setIncomeTransactions(transactions);
        } catch (error) {
            console.error("Error loading income transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = async () => {
        if (newAmount <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'transactions'), {
                type: 'income',
                amount: newAmount,
                description: newDescription || 'Receita',
                category: 'Receita',
                pilar: 'Receita',
                date: Timestamp.fromDate(new Date(currentYear, currentMonth - 1, new Date().getDate())),
                paymentMethod: 'pix',
                createdAt: Timestamp.now(),
            });

            setNewAmount(0);
            setNewDescription('');
            setAddingNew(false);
            await loadIncomeTransactions();
        } catch (error) {
            console.error("Error adding income:", error);
            alert('Erro ao adicionar receita. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (id: string) => {
        if (editAmount <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, 'transactions', id), {
                amount: editAmount,
                description: editDescription
            });

            setEditingId(null);
            await loadIncomeTransactions();
        } catch (error) {
            console.error("Error updating income:", error);
            alert('Erro ao atualizar receita. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta receita?')) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, 'transactions', id));
            await loadIncomeTransactions();
        } catch (error) {
            console.error("Error deleting income:", error);
            alert('Erro ao excluir receita. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (transaction: Transaction & { id: string }) => {
        setEditingId(transaction.id);
        setEditAmount(transaction.amount);
        setEditDescription(transaction.description);
    };

    if (!isOpen) return null;

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Gerenciar Receitas
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Loading State */}
                    {loading && incomeTransactions.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && incomeTransactions.length === 0 && !addingNew && (
                        <div className="text-center py-8">
                            <p className="text-slate-500 mb-4">Nenhuma receita cadastrada neste mês</p>
                        </div>
                    )}

                    {/* Existing Income Transactions */}
                    {incomeTransactions.map((transaction) => (
                        editingId === transaction.id ? (
                            <div key={transaction.id} className="bg-blue-50 p-4 rounded-lg border-2 border-blue-500 space-y-2">
                                <input
                                    type="text"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                                    placeholder="Descrição"
                                />
                                <CurrencyInput
                                    value={editAmount}
                                    onChange={setEditAmount}
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleEdit(transaction.id)}
                                        disabled={loading}
                                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800">{transaction.description}</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEdit(transaction)}
                                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(transaction.id)}
                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )
                    ))}

                    {/* Add New Income Form */}
                    {addingNew ? (
                        <div className="bg-emerald-50 p-4 rounded-lg border-2 border-emerald-500 space-y-2">
                            <input
                                type="text"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                                placeholder="Descrição (ex: Salário, Freelance)"
                            />
                            <CurrencyInput
                                value={newAmount}
                                onChange={setNewAmount}
                                className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setAddingNew(false);
                                        setNewAmount(0);
                                        setNewDescription('');
                                    }}
                                    className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddNew}
                                    disabled={loading}
                                    className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Adicionar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAddingNew(true)}
                            className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Adicionar Nova Receita
                        </button>
                    )}

                    {/* Total Summary */}
                    {incomeTransactions.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                            <p className="text-sm text-blue-700 font-medium mb-1">Total de Receitas do Mês:</p>
                            <p className="text-2xl font-bold text-blue-800">
                                {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
