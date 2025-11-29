'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { useSettings } from '@/context/SettingsContext';

interface EditIncomeSourcesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditIncomeSourcesModal({ isOpen, onClose }: EditIncomeSourcesModalProps) {
    const { incomeSources, setIncomeSources } = useSettings();
    const [localSources, setLocalSources] = useState(incomeSources);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalSources(incomeSources);
        }
    }, [isOpen, incomeSources]);

    const addSource = () => {
        setLocalSources([...localSources, { id: Date.now().toString(), name: '', amount: 0 }]);
    };

    const removeSource = (id: string) => {
        setLocalSources(localSources.filter(s => s.id !== id));
    };

    const updateSource = (id: string, field: 'name' | 'amount', value: string | number) => {
        setLocalSources(localSources.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        ));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Filter out empty sources
            const validSources = localSources.filter(s => s.name.trim() !== '' && s.amount > 0);
            setIncomeSources(validSources);
            onClose();
        } catch (error) {
            console.error("Error updating income sources:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const totalIncome = localSources.reduce((sum, s) => sum + s.amount, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">
                        Gerenciar Fontes de Receita
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    {localSources.map((source, index) => (
                        <div key={source.id} className="flex gap-2 items-start p-4 bg-slate-50 rounded-lg">
                            <div className="flex-1 space-y-2">
                                <input
                                    type="text"
                                    value={source.name}
                                    onChange={(e) => updateSource(source.id, 'name', e.target.value)}
                                    placeholder="Nome da fonte (ex: Salário, Freelance)"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800"
                                />
                                <CurrencyInput
                                    value={source.amount}
                                    onChange={(value) => updateSource(source.id, 'amount', value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                                />
                            </div>
                            <button
                                onClick={() => removeSource(source.id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remover fonte"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addSource}
                        className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-600 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Adicionar Fonte de Receita
                    </button>

                    {localSources.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-700 font-medium">Total de Receitas:</p>
                            <p className="text-2xl font-bold text-blue-800">
                                {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Salvar Receitas
                    </button>
                </div>
            </div>
        </div>
    );
}
