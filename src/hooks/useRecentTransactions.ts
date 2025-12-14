import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types';

/**
 * Hook to fetch the most recently INSERTED transactions across all months
 * Sorted by createdAt timestamp, not by transaction date
 */
export function useRecentTransactions(limitCount: number = 10) {
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [creditCardTransactions, setCreditCardTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        try {
            // Query for most recent transactions by createdAt
            // For backward compatibility, transactions without createdAt will appear last
            const q = query(
                collection(db, 'transactions'),
                orderBy('createdAt', 'desc'),
                limit(limitCount * 2) // Fetch more to ensure we have enough credit card ones
            );

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const docs = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            date: (data.date as Timestamp).toDate(),
                            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : undefined,
                        };
                    }) as Transaction[];

                    // Set all recent transactions (limited to requested count)
                    setAllTransactions(docs.slice(0, limitCount));

                    // Filter credit card transactions
                    const creditCardOnly = docs.filter(t => t.paymentMethod === 'credit_card');
                    setCreditCardTransactions(creditCardOnly.slice(0, limitCount));

                    setLoading(false);
                },
                (err) => {
                    console.error('Firestore Error:', err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err: any) {
            console.error('Query Error:', err);
            setError(err.message);
            setLoading(false);
            return () => {};
        }
    }, [limitCount]);

    return {
        allTransactions,
        creditCardTransactions,
        loading,
        error,
    };
}
