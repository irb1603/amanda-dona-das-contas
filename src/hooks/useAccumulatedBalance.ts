import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSettings } from '@/context/SettingsContext';

export function useAccumulatedBalance(upToYear: number, upToMonth: number) {
    const [accumulatedBalance, setAccumulatedBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const { openingBalance } = useSettings();

    useEffect(() => {
        const calculateAccumulatedBalance = async () => {
            setLoading(true);
            try {
                // Calculate balance from opening balance up to (but not including) the specified month
                // We'll query all transactions before the specified month
                const endDate = new Date(upToYear, upToMonth - 1, 1); // First day of the month
                const startDate = new Date(2000, 0, 1); // Arbitrary start date (year 2000)

                const q = query(
                    collection(db, 'transactions'),
                    where('date', '>=', startDate),
                    where('date', '<', endDate)
                );

                const snapshot = await getDocs(q);
                let totalIncome = 0;
                let totalExpense = 0;

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.type === 'income') {
                        totalIncome += data.amount || 0;
                    } else if (data.type === 'expense') {
                        totalExpense += data.amount || 0;
                    }
                });

                const accumulated = openingBalance + totalIncome - totalExpense;
                setAccumulatedBalance(accumulated);
            } catch (error) {
                console.error('Error calculating accumulated balance:', error);
                setAccumulatedBalance(openingBalance);
            } finally {
                setLoading(false);
            }
        };

        calculateAccumulatedBalance();
    }, [upToYear, upToMonth, openingBalance]);

    return { accumulatedBalance, loading };
}
