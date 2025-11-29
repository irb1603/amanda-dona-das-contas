'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, TrendingUp } from 'lucide-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface EditIncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentIncome: number;
    currentYear: number;
    currentMonth: number;
}

export default function EditIncomeModal({ isOpen, onClose, currentIncome, currentYear, currentMonth }: EditIncomeModalProps) {
    const [amount, setAmount] = useState(0);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount(0);
            setDescription('Receita');
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (amount <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        setLoading(true);
        try {
            // Create income transaction
            await addDoc(collection(db, 'transactions'), {
                type: 'income',
                amount,
                description: description || 'Receita',
                category: 'Receita',
                pilar: 'Receita',
                date: Timestamp.fromDate(new Date(currentYear, currentMonth - 1, new Date().getDate())),
                paymentMethod: 'pix',
                createdAt: Timestamp.now(),
            });

            setAmount(0);
            setDescription('');
            onClose();
        } catch (error) {
            console.error("Error adding income:", error);
            alert('Erro ao adicionar receita. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="text-blue-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Adicionar Receita
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            Descrição
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Salário, Freelance, Bônus"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            Valor da Receita
                        </label>
                        <CurrencyInput
                            value={amount}
                            onChange={setAmount}
                            className="w-full px-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 text-2xl"
                        />
                    </div>

                    {currentIncome > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 font-medium mb-1">Receita atual do mês:</p>
                            <p className="text-lg font-bold text-blue-800">
                                {currentIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            {amount > 0 && (
                                <>
                                    <p className="text-sm text-blue-700 font-medium mt-2 mb-1">Novo total:</p>
                                    <p className="text-2xl font-bold text-blue-900">
                                        {(currentIncome + amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading || amount <= 0}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Adicionar Receita
                    </button>
                </div>
            </div>
        </div>
    );
}
