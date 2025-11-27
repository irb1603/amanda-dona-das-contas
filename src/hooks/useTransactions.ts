import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, Pilar } from '@/types';
import { useSettings } from '@/context/SettingsContext';

export function useTransactions(year: number, month: number) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { categoryMapping } = useSettings();

    // Totals
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [balance, setBalance] = useState(0);

    // Pillars
    const [pillars, setPillars] = useState<Record<Pilar, number>>({
        'Despesas Fixas': 0,
        'Investimentos': 0,
        'Guilty-free': 0,
        'Imprevistos': 0,
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Start of month
        const start = new Date(year, month - 1, 1);
        // End of month
        const end = new Date(year, month, 0, 23, 59, 59);

        try {
            const q = query(
                collection(db, 'transactions'),
                where('date', '>=', start),
                where('date', '<=', end),
                orderBy('date', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: (doc.data().date as Timestamp).toDate(), // Convert Timestamp to Date
                })) as Transaction[];

                setTransactions(docs);

                // Calculate Totals
                let inc = 0;
                let exp = 0;
                const pilarCounts: Record<Pilar, number> = {
                    'Despesas Fixas': 0,
                    'Investimentos': 0,
                    'Guilty-free': 0,
                    'Imprevistos': 0,
                };

                docs.forEach(t => {
                    if (t.type === 'income') {
                        inc += t.amount;
                    } else {
                        exp += t.amount;

                        // Determine Pillar: Check Mapping first, then Transaction's own pilar
                        let pilar = t.pilar;
                        if (categoryMapping[t.category]) {
                            pilar = categoryMapping[t.category];
                        }

                        if (pilar && pilarCounts[pilar] !== undefined) {
                            pilarCounts[pilar] += t.amount;
                        }
                    }
                });

                setIncome(inc);
                setExpense(exp);
                setBalance(inc - exp); // This is just monthly balance
                setPillars(pilarCounts);
                setLoading(false);
            }, (err) => {
                console.error("Firestore Error:", err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            console.error("Query Error:", err);
            setError(err.message);
            setLoading(false);
            return () => { };
        }
    }, [year, month, categoryMapping]); // Re-run if mapping changes

    return { transactions, loading, error, income, expense, balance, pillars };
}
