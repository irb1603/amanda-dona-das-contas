'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { X, Save, Plus, Trash2, Wrench, Loader2 } from 'lucide-react';
import { CATEGORIES, PILARS } from '@/constants';
import CurrencyInput from '@/components/ui/CurrencyInput';
import { Pilar } from '@/types';
import { removeDuplicateTransactions } from '@/services/transactionService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PILLARS: Pilar[] = ['Despesas Fixas', 'Investimentos', 'Guilty-free', 'Imprevistos'];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        pillarGoals, setPillarGoals,
        categoryMapping, setCategoryMapping,
        incomeTarget, setIncomeTarget,
        expenseTarget, setExpenseTarget,
        openingBalance, setOpeningBalance,
        incomeSources, setIncomeSources,
        categoryBudgets, setCategoryBudgets
    } = useSettings();

    const { selectedDate } = useMonth();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1;
    const { transactions } = useTransactions(currentYear, currentMonth);

    // Local state for form
    const [activeTab, setActiveTab] = useState<'general' | 'categories'>('general');
    const [localGoals, setLocalGoals] = useState(pillarGoals);
    const [localMapping, setLocalMapping] = useState(categoryMapping);
    const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({}); // Initialized with empty object
    const [localIncomeTarget, setLocalIncomeTarget] = useState(incomeTarget);
    const [localExpenseTarget, setLocalExpenseTarget] = useState(expenseTarget);
    const [localOpeningBalance, setLocalOpeningBalance] = useState(0); // Initialized with 0
    const [localIncomeSources, setLocalIncomeSources] = useState<{ id: string; name: string; amount: number }[]>([]); // Initialized with empty array

    // New mapping entry state
    const [newCategory, setNewCategory] = useState('');

    const [newPillar, setNewPillar] = useState<Pilar>('Despesas Fixas');

    // Cleanup state
    const [isCleaning, setIsCleaning] = useState(false);
    const [cleanupMessage, setCleanupMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalGoals(pillarGoals);
            setLocalMapping(categoryMapping);
            setLocalBudgets(categoryBudgets);
            setLocalIncomeTarget(incomeTarget);
            setLocalExpenseTarget(expenseTarget);
            setLocalOpeningBalance(openingBalance);
            setLocalIncomeSources(incomeSources);
        }
    }, [isOpen, pillarGoals, categoryMapping, categoryBudgets, incomeTarget, expenseTarget, openingBalance, incomeSources]);

    const handleSave = () => {
        setPillarGoals(localGoals);
        setCategoryMapping(localMapping);
        setCategoryBudgets(localBudgets);
        setIncomeTarget(localIncomeSources.reduce((acc, s) => acc + s.amount, 0)); // Auto-update income target based on sources
        setExpenseTarget(localExpenseTarget);
        setOpeningBalance(localOpeningBalance);
        setIncomeSources(localIncomeSources);
        onClose();
    };

    const addMapping = () => {
        if (newCategory) {
            setLocalMapping(prev => ({ ...prev, [newCategory]: newPillar }));
            setNewCategory('');
        }
    };

    const removeMapping = (category: string) => {
        const newMap = { ...localMapping };
        delete newMap[category];
        setLocalMapping(newMap);
    };

    const handleCleanup = async () => {
        setIsCleaning(true);
        setCleanupMessage('');
        try {
            const count = await removeDuplicateTransactions();
            setCleanupMessage(`Sucesso! ${count} duplicatas removidas.`);
        } catch (error) {
            console.error(error);
            setCleanupMessage('Erro ao remover duplicatas.');
        } finally {
            setIsCleaning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="sticky top-0 bg-white p-6 border-b border-slate-100 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-slate-800">Configurações Gerais</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Section 1: Financial Targets & Income Sources */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Metas e Fontes de Renda</h3>

                        {/* Basic Targets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Saldo Inicial</label>
                                <input
                                    type="number"
                                    value={localOpeningBalance}
                                    onChange={e => setLocalOpeningBalance(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Teto de Gastos</label>
                                <input
                                    type="number"
                                    value={localExpenseTarget}
                                    onChange={e => setLocalExpenseTarget(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                />
                            </div>
                        </div>

                        {/* Income Sources List */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-3">Fontes de Renda (Salários, Extras...)</h4>
                            <div className="space-y-3">
                                {localIncomeSources.map((source, index) => (
                                    <div key={source.id} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={source.name}
                                            onChange={e => {
                                                const newSources = [...localIncomeSources];
                                                newSources[index].name = e.target.value;
                                                setLocalIncomeSources(newSources);
                                            }}
                                            placeholder="Nome (ex: Salário A)"
                                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium"
                                        />
                                        <input
                                            type="number"
                                            value={source.amount}
                                            onChange={e => {
                                                const newSources = [...localIncomeSources];
                                                newSources[index].amount = parseFloat(e.target.value) || 0;
                                                setLocalIncomeSources(newSources);
                                            }}
                                            placeholder="Valor"
                                            className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium"
                                        />
                                        <button
                                            onClick={() => {
                                                const newSources = localIncomeSources.filter(s => s.id !== source.id);
                                                setLocalIncomeSources(newSources);
                                            }}
                                            className="text-red-400 hover:text-red-600 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setLocalIncomeSources([...localIncomeSources, { id: Date.now().toString(), name: '', amount: 0 }])}
                                    className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700"
                                >
                                    <Plus size={16} /> Adicionar Fonte de Renda
                                </button>
                            </div>
                            <div className="mt-3 text-right">
                                <p className="text-xs text-slate-500">Total Previsto: {localIncomeSources.reduce((acc, s) => acc + s.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Pillar Goals */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Metas dos 4 Pilares (%)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Fixas</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={(localGoals.fixed * 100).toFixed(0)}
                                        onChange={e => setLocalGoals(prev => ({ ...prev, fixed: parseFloat(e.target.value) / 100 }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Investimentos</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={(localGoals.investments * 100).toFixed(0)}
                                        onChange={e => setLocalGoals(prev => ({ ...prev, investments: parseFloat(e.target.value) / 100 }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Lazer</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={(localGoals.guiltyFree * 100).toFixed(0)}
                                        onChange={e => setLocalGoals(prev => ({ ...prev, guiltyFree: parseFloat(e.target.value) / 100 }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">Imprevistos</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={(localGoals.emergency * 100).toFixed(0)}
                                        onChange={e => setLocalGoals(prev => ({ ...prev, emergency: parseFloat(e.target.value) / 100 }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                                    />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Category Mapping & Budgets */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Mapeamento e Orçamentos</h3>
                        <p className="text-sm text-slate-600 font-medium mb-4">Defina o pilar e o limite de orçamento para cada categoria.</p>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                placeholder="Nova Categoria (ex: Presentes)"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
                            />
                            <select
                                value={newPillar}
                                onChange={e => setNewPillar(e.target.value as Pilar)}
                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-900 font-medium"
                            >
                                {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button
                                onClick={addMapping}
                                className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
                            {PILLARS.map(pillar => {
                                const allCategoryNames = Array.from(new Set([...CATEGORIES.map(c => c.name), ...Object.keys(localMapping)]));

                                const categoriesInThisPillar = allCategoryNames.filter(catName => {
                                    const mappedPillar = localMapping[catName];
                                    if (mappedPillar) return mappedPillar === pillar;

                                    const defaultCat = CATEGORIES.find(c => c.name === catName);
                                    return defaultCat?.pilar === pillar;
                                }).sort();

                                if (categoriesInThisPillar.length === 0) return null;

                                return (
                                    <div key={pillar} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">{pillar}</h4>
                                        <div className="space-y-2">
                                            {categoriesInThisPillar.map((cat) => {
                                                const isCustom = !!localMapping[cat];
                                                const isDefault = CATEGORIES.some(c => c.name === cat);
                                                const budget = localBudgets[cat] || 0;

                                                return (
                                                    <div key={cat} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span className="font-bold text-slate-800">{cat}</span>
                                                            {isDefault && !isCustom && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Padrão</span>}
                                                            {isCustom && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Personalizado</span>}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-slate-400 font-medium">Meta:</span>
                                                                <input
                                                                    type="number"
                                                                    value={budget}
                                                                    onChange={e => setLocalBudgets(prev => ({ ...prev, [cat]: parseFloat(e.target.value) || 0 }))}
                                                                    className="w-24 px-2 py-1 border border-slate-200 rounded text-sm text-right font-medium text-slate-700 focus:ring-1 focus:ring-emerald-500 outline-none"
                                                                    placeholder="0,00"
                                                                />
                                                            </div>

                                                            {isCustom && (
                                                                <button onClick={() => removeMapping(cat)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded" title="Remover personalização">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Section 4: Maintenance */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Manutenção</h3>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-slate-700">Corrigir Duplicatas</h4>
                                <p className="text-xs text-slate-500">Remove transações fixas duplicadas (mesmo mês/ano).</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={handleCleanup}
                                    disabled={isCleaning}
                                    className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    {isCleaning ? <Loader2 size={16} className="animate-spin" /> : <Wrench size={16} />}
                                    Corrigir
                                </button>
                                {cleanupMessage && <span className="text-xs font-bold text-emerald-600">{cleanupMessage}</span>}
                            </div>
                        </div>
                    </section>
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
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}
