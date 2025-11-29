'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { useSettings } from '@/context/SettingsContext';

interface EditTargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'income' | 'expense';
}

export default function EditTargetModal({ isOpen, onClose, type }: EditTargetModalProps) {
    const { incomeTarget, setIncomeTarget, expenseTarget, setExpenseTarget } = useSettings();
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setValue(type === 'income' ? incomeTarget : expenseTarget);
        }
    }, [isOpen, type, incomeTarget, expenseTarget]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (type === 'income') {
                setIncomeTarget(value);
            } else {
                setExpenseTarget(value);
            }
            onClose();
        } catch (error) {
            console.error("Error updating target:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        Editar Meta de {type === 'income' ? 'Receitas' : 'Despesas'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-1">
                            Valor da Meta
                        </label>
                        <CurrencyInput
                            value={value}
                            onChange={setValue}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-800 text-lg"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                            Este valor será usado como referência para a barra de progresso.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar Meta
                    </button>
                </div>
            </div>
        </div>
    );
}
