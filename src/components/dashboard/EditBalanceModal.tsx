'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { X, Save } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface EditBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    monthlyBalance: number;
}

export default function EditBalanceModal({ isOpen, onClose, currentBalance, monthlyBalance }: EditBalanceModalProps) {
    const { setOpeningBalance } = useSettings();
    const [newBalance, setNewBalance] = useState(currentBalance);

    useEffect(() => {
        if (isOpen) {
            setNewBalance(currentBalance);
        }
    }, [isOpen, currentBalance]);

    const handleSave = () => {
        // Current = Opening + Monthly
        // Opening = Current - Monthly
        const newOpeningBalance = newBalance - monthlyBalance;
        setOpeningBalance(newOpeningBalance);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Editar Saldo Atual</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        Ajuste o valor total que você possui hoje. O sistema calculará automaticamente o Saldo Inicial necessário.
                    </p>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-800">Saldo Total Atual</label>
                        <CurrencyInput
                            value={newBalance}
                            onChange={setNewBalance}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-slate-800"
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 space-y-1">
                        <div className="flex justify-between">
                            <span>Balanço do Mês (Receitas - Despesas):</span>
                            <span className={monthlyBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {monthlyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Novo Saldo Inicial (Calculado):</span>
                            <span>{(newBalance - monthlyBalance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-bold flex items-center gap-2"
                    >
                        <Save size={18} /> Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
