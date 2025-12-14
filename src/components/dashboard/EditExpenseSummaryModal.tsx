import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import CurrencyInput from '@/components/ui/CurrencyInput';

interface EditExpenseSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    calculatedValues: {
        dux: number;
        c6: number;
        debit: number;
    };
}

export default function EditExpenseSummaryModal({ isOpen, onClose, calculatedValues }: EditExpenseSummaryModalProps) {
    const { expenseOverrides, setExpenseOverrides } = useSettings();

    // Local state for editing. null means "use calculated"
    const [dux, setDux] = useState<number | null>(null);
    const [c6, setC6] = useState<number | null>(null);
    const [debit, setDebit] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            setDux(expenseOverrides.dux);
            setC6(expenseOverrides.c6);
            setDebit(expenseOverrides.debit);
        }
    }, [isOpen, expenseOverrides]);

    const handleSave = () => {
        setExpenseOverrides({
            dux,
            c6,
            debit
        });
        onClose();
    };

    const handleReset = (field: 'dux' | 'c6' | 'debit') => {
        if (field === 'dux') setDux(null);
        if (field === 'c6') setC6(null);
        if (field === 'debit') setDebit(null);
    };

    const resetAll = () => {
        setDux(null);
        setC6(null);
        setDebit(null);
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-bold text-slate-900">
                                        Resumo de Despesas
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-2">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <p>Você pode sobrescrever os valores calculados manualmente. Para voltar ao cálculo automático, clique em "Resetar".</p>
                                </div>

                                <div className="space-y-6">
                                    {/* DUX */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-bold text-slate-700">Cartão DUX</label>
                                            <span className="text-xs text-slate-500">Calculado: {calculatedValues.dux.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <CurrencyInput
                                                value={dux !== null ? dux : calculatedValues.dux}
                                                onChange={setDux}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium ${dux !== null ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}
                                            />
                                            {dux !== null && (
                                                <button onClick={() => handleReset('dux')} className="text-xs text-slate-400 hover:text-red-500 underline self-center">Resetar</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* C6 */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-bold text-slate-700">Cartão C6</label>
                                            <span className="text-xs text-slate-500">Calculado: {calculatedValues.c6.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <CurrencyInput
                                                value={c6 !== null ? c6 : calculatedValues.c6}
                                                onChange={setC6}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium ${c6 !== null ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}
                                            />
                                            {c6 !== null && (
                                                <button onClick={() => handleReset('c6')} className="text-xs text-slate-400 hover:text-red-500 underline self-center">Resetar</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Debit */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="text-sm font-bold text-slate-700">Débito</label>
                                            <span className="text-xs text-slate-500">Calculado: {calculatedValues.debit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <CurrencyInput
                                                value={debit !== null ? debit : calculatedValues.debit}
                                                onChange={setDebit}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium ${debit !== null ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-600'}`}
                                            />
                                            {debit !== null && (
                                                <button onClick={() => handleReset('debit')} className="text-xs text-slate-400 hover:text-red-500 underline self-center">Resetar</button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { resetAll(); handleSave(); }}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                                    >
                                        Atualizar (Recalcular para valores reais)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Salvar Alterações Manuais
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
