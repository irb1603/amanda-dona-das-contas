'use client';

import { useState } from 'react';
import { parseTransactionsCSV } from '@/utils/csvParser';
import { Transaction } from '@/types';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            try {
                const data = await parseTransactionsCSV(f);
                setPreview(data.slice(0, 5)); // Preview first 5
                setMsg(`Arquivo carregado. ${data.length} transações encontradas.`);
            } catch (err) {
                console.error(err);
                setMsg('Erro ao ler arquivo.');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const transactions = await parseTransactionsCSV(file);

            // Batch write (limit 500 per batch)
            const batchSize = 450;
            const chunks = [];
            for (let i = 0; i < transactions.length; i += batchSize) {
                chunks.push(transactions.slice(i, i + batchSize));
            }

            let count = 0;
            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach((trx) => {
                    const ref = doc(collection(db, 'transactions'));
                    batch.set(ref, trx);
                });
                await batch.commit();
                count += chunk.length;
                setMsg(`Importando... ${count}/${transactions.length}`);
            }

            setStatus('success');
            setMsg('Importação concluída com sucesso!');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            // Show more specific error if available
            const errorMessage = err?.message || 'Erro desconhecido ao salvar no Firebase.';
            setMsg(`Erro: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-slate-800">Importar Dados</h1>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <Upload size={32} />
                    </div>
                    <div>
                        <label htmlFor="csv-upload" className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                            Selecionar CSV
                        </label>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    {file && <p className="text-sm text-slate-600">{file.name}</p>}
                    {msg && <p className="text-sm font-medium text-slate-500">{msg}</p>}
                </div>
            </div>

            {preview.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 font-semibold text-slate-700">
                        Pré-visualização
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3">Descrição</th>
                                    <th className="px-4 py-3">Valor</th>
                                    <th className="px-4 py-3">Categoria</th>
                                    <th className="px-4 py-3">Tipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((t, i) => (
                                    <tr key={i} className="border-b border-slate-50 last:border-none">
                                        <td className="px-4 py-3">{t.date.toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{t.description}</td>
                                        <td className="px-4 py-3 font-medium">
                                            {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-4 py-3">{t.category}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {t.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={loading || status === 'success'}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                            {loading ? 'Importando...' : 'Confirmar Importação'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
