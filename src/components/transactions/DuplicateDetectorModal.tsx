'use client';

import { useState } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Transaction } from '@/types';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DuplicateGroup {
    key: string;
    transactions: (Transaction & { id: string })[];
    description: string;
    amount: number;
    date: string;
    category: string;
    paymentMethod: string;
}

interface DuplicateDetectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: (Transaction & { id: string })[];
    onUpdate: () => void;
}

export default function DuplicateDetectorModal({ isOpen, onClose, transactions, onUpdate }: DuplicateDetectorModalProps) {
    const [loading, setLoading] = useState(false);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

    // Detect duplicates
    const detectDuplicates = (): DuplicateGroup[] => {
        const groups = new Map<string, (Transaction & { id: string })[]>();

        transactions.forEach((transaction) => {
            // Create a key based on all visible fields
            const dateStr = transaction.date.toISOString().split('T')[0];
            const key = [
                transaction.description.trim().toLowerCase(),
                transaction.amount.toFixed(2),
                dateStr,
                transaction.category.trim().toLowerCase(),
                transaction.paymentMethod || 'none',
                transaction.cardSource?.trim().toLowerCase() || 'none'
            ].join('|');

            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(transaction);
        });

        // Filter only groups with more than 1 transaction (duplicates)
        const duplicates: DuplicateGroup[] = [];
        groups.forEach((txs, key) => {
            if (txs.length > 1) {
                duplicates.push({
                    key,
                    transactions: txs,
                    description: txs[0].description,
                    amount: txs[0].amount,
                    date: txs[0].date.toLocaleDateString('pt-BR'),
                    category: txs[0].category,
                    paymentMethod: txs[0].paymentMethod || 'N/A',
                });
            }
        });

        return duplicates;
    };

    const duplicates = detectDuplicates();

    const handleDelete = async (transactionId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

        setDeletingIds(prev => new Set(prev).add(transactionId));

        try {
            await deleteDoc(doc(db, 'transactions', transactionId));
            onUpdate();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Erro ao excluir transação.');
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(transactionId);
                return next;
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <AlertTriangle className="text-amber-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Detector de Duplicatas
                            </h2>
                            <p className="text-sm text-slate-600">
                                {duplicates.length === 0
                                    ? 'Nenhuma duplicata encontrada neste mês'
                                    : `${duplicates.length} grupo(s) de transações duplicadas encontradas`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {duplicates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-slate-800 mb-2">
                                Tudo limpo! 🎉
                            </p>
                            <p className="text-slate-600">
                                Não foram encontradas transações duplicadas neste mês.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {duplicates.map((group, groupIndex) => (
                                <div key={group.key} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                                            {groupIndex + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800 mb-1">
                                                {group.description}
                                            </h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                                                <span>💰 {group.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                <span>📅 {group.date}</span>
                                                <span>🏷️ {group.category}</span>
                                                <span>💳 {group.paymentMethod}</span>
                                            </div>
                                            <p className="text-xs text-amber-700 font-medium mt-2">
                                                ⚠️ {group.transactions.length} transações idênticas encontradas
                                            </p>
                                        </div>
                                    </div>

                                    {/* List of duplicate transactions */}
                                    <div className="space-y-2 ml-11">
                                        {group.transactions.map((transaction, txIndex) => (
                                            <div
                                                key={transaction.id}
                                                className="bg-white border border-amber-200 rounded-lg p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        #{txIndex + 1}
                                                    </span>
                                                    <div className="text-sm">
                                                        <p className="font-medium text-slate-700">
                                                            {transaction.description}
                                                        </p>
                                                        {transaction.id && (
                                                            <p className="text-xs text-slate-400 font-mono">
                                                                ID: {transaction.id.substring(0, 8)}...
                                                            </p>
                                                        )}
                                                        {transaction.installmentIndex && (
                                                            <p className="text-xs text-blue-600 font-medium">
                                                                Parcela {transaction.installmentIndex}/{transaction.totalInstallments}
                                                            </p>
                                                        )}
                                                        {transaction.isFixed && (
                                                            <p className="text-xs text-purple-600 font-medium">
                                                                Despesa Fixa/Recorrente
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(transaction.id!)}
                                                    disabled={deletingIds.has(transaction.id!)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Excluir esta transação"
                                                >
                                                    {deletingIds.has(transaction.id!) ? (
                                                        <Loader2 className="animate-spin" size={18} />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-6">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                            💡 Dica: Mantenha apenas uma cópia de cada transação duplicada
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
