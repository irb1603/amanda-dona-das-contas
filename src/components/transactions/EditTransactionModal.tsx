'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Save, Loader2 } from 'lucide-react';
import { Transaction, PaymentMethod } from '@/types';
import { doc, updateDoc, deleteDoc, query, collection, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { CATEGORIES } from '@/constants';

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
        paymentMethod: 'credit_card' as PaymentMethod,
        cardSource: 'Cartão DUX' as string | undefined,
    });
    const [loading, setLoading] = useState(false);
    const [updateAllInstallments, setUpdateAllInstallments] = useState(false);

    useEffect(() => {
        if (transaction) {
            console.log('EditTransactionModal - Transaction data:', {
                id: transaction.id,
                description: transaction.description,
                parentTransactionId: transaction.parentTransactionId,
                totalInstallments: transaction.totalInstallments,
                installmentIndex: transaction.installmentIndex,
                hasParent: !!transaction.parentTransactionId,
                hasTotal: !!transaction.totalInstallments,
                isMultiple: transaction.totalInstallments ? transaction.totalInstallments > 1 : false,
                shouldShowCheckbox: !!(transaction.parentTransactionId && transaction.totalInstallments && transaction.totalInstallments > 1)
            });

            setFormData({
                description: transaction.description,
                amount: transaction.amount,
                date: transaction.date.toISOString().split('T')[0],
                category: transaction.category,
                paymentMethod: transaction.paymentMethod || 'debit_card',
                cardSource: transaction.cardSource,
            });
        }
    }, [transaction]);

    const handleSave = async () => {
        if (!transaction) return;
        setLoading(true);

        try {
            // If this is an installment and user wants to update all
            if (updateAllInstallments && transaction.parentTransactionId) {
                // Find all installments with the same parentTransactionId
                const q = query(
                    collection(db, 'transactions'),
                    where('parentTransactionId', '==', transaction.parentTransactionId)
                );
                const snapshot = await getDocs(q);

                // Update all installments
                const updatePromises = snapshot.docs.map(async (docSnap) => {
                    const installmentData = docSnap.data() as Transaction;
                    const installmentRef = doc(db, 'transactions', docSnap.id);

                    // Split amount equally among installments
                    const installmentAmount = formData.amount / (transaction.totalInstallments || 1);

                    await updateDoc(installmentRef, {
                        description: `${formData.description.split(' (')[0]} (${installmentData.installmentIndex}/${installmentData.totalInstallments})`,
                        amount: installmentAmount,
                        category: formData.category,
                        paymentMethod: formData.paymentMethod,
                        cardSource: formData.cardSource,
                    });
                });

                await Promise.all(updatePromises);
            } else {
                // Update only this transaction
                const ref = doc(db, 'transactions', transaction.id!);
                await updateDoc(ref, {
                    ...formData,
                    date: new Date(formData.date),
                });
            }

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl my-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
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
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
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
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">Categoria</label>
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800 bg-white"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name} ({cat.pilar})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Forma de Pagamento</label>
                        <div className="flex flex-col gap-2">
                            {[
                                { id: 'dux', label: 'Cartão de crédito DUX', method: 'credit_card', source: 'Cartão DUX' },
                                { id: 'c6', label: 'Cartão de crédito C6', method: 'credit_card', source: 'Cartão C6' },
                                { id: 'bb', label: 'Cartão de crédito BB', method: 'credit_card', source: 'Cartão BB' },
                                { id: 'debit', label: 'Débito', method: 'debit_card', source: undefined },
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setFormData({
                                        ...formData,
                                        paymentMethod: option.method as PaymentMethod,
                                        cardSource: option.source
                                    })}
                                    className={`w-full p-3 rounded-xl border text-left transition-all ${((formData.paymentMethod === 'credit_card' && formData.cardSource === option.source) ||
                                        (formData.paymentMethod === 'debit_card' && option.method === 'debit_card'))
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-500'
                                        : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Installment Update Option */}
                    {transaction.parentTransactionId && transaction.totalInstallments && transaction.totalInstallments > 1 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={updateAllInstallments}
                                    onChange={e => setUpdateAllInstallments(e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800 text-sm">
                                        Atualizar todas as {transaction.totalInstallments} parcelas
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Isso atualizará a descrição, valor, categoria e forma de pagamento de todas as parcelas desta compra
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}
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
