'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Save, Loader2 } from 'lucide-react';
import { Transaction, PaymentMethod } from '@/types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface EditTransactionModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function EditTransactionModal({ transaction, isOpen, onClose, onUpdate }: EditTransactionModalProps) {
    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        date: '',
        category: '',
        paymentMethod: 'debit_card' as PaymentMethod,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (transaction) {
            setFormData({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date.toISOString().split('T')[0],
                category: transaction.category,
                paymentMethod: transaction.paymentMethod || 'debit_card',
            });
        }
    }, [transaction]);

    const handleSave = async () => {
        if (!transaction) return;
        setLoading(true);

        try {
            const ref = doc(db, 'transactions', transaction.id!);
            await updateDoc(ref, {
                ...formData,
                date: new Date(formData.date), // Convert string back to Date
            });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error updating transaction:", error);
            alert("Erro ao atualizar transação.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!transaction) return;
        if (!confirm("Tem certeza que deseja excluir esta transação?")) return;
        setLoading(true);

        try {
            const ref = doc(db, 'transactions', transaction.id!);
            await deleteDoc(ref);
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Erro ao excluir transação.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Editar Transação</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Descrição</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Valor</label>
                        <CurrencyInput
                            value={formData.amount}
                            onChange={val => setFormData({ ...formData, amount: val })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Data</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Categoria</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Forma de Pagamento</label>
                        <select
                            value={formData.paymentMethod}
                            onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                            <option value="credit_card">Cartão de Crédito</option>
                            <option value="debit_card">Cartão de Débito</option>
                            <option value="pix">Pix</option>
                            <option value="cash">Dinheiro</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleDelete}
                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={18} /> Excluir
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
