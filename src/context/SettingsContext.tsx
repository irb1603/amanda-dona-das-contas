'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pilar } from '@/types';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PillarGoals {
    fixed: number;      // 0.65
    investments: number; // 0.15
    guiltyFree: number;  // 0.15
    emergency: number;   // 0.05
}

interface SettingsContextType {
    openingBalance: number;
    setOpeningBalance: (value: number) => void;
    pillarGoals: PillarGoals;
    setPillarGoals: (goals: PillarGoals) => void;
    categoryMapping: Record<string, Pilar>;
    setCategoryMapping: (mapping: Record<string, Pilar>) => void;
    categoryBudgets: Record<string, number>;
    setCategoryBudgets: (budgets: Record<string, number>) => void;
    incomeTarget: number;
    setIncomeTarget: (value: number) => void;
    expenseTarget: number;
    setExpenseTarget: (value: number) => void;
    incomeSources: { id: string; name: string; amount: number }[];
    setIncomeSources: (sources: { id: string; name: string; amount: number }[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [openingBalance, setOpeningBalance] = useState(0);
    const [pillarGoals, setPillarGoals] = useState<PillarGoals>({
        fixed: 0.65,
        investments: 0.15,
        guiltyFree: 0.15,
        emergency: 0.05,
    });
    const [categoryMapping, setCategoryMapping] = useState<Record<string, Pilar>>({});
    const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
    const [incomeTarget, setIncomeTarget] = useState(0);
    const [expenseTarget, setExpenseTarget] = useState(0);
    const [incomeSources, setIncomeSources] = useState<{ id: string; name: string; amount: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const SETTINGS_DOC_ID = 'global_settings';

    // Load settings from Firestore on mount (and sync real-time)
    useEffect(() => {
        const docRef = doc(db, 'settings', SETTINGS_DOC_ID);

        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setOpeningBalance(data.openingBalance || 0);
                setPillarGoals(data.pillarGoals || { fixed: 0.65, investments: 0.15, guiltyFree: 0.15, emergency: 0.05 });
                setCategoryMapping(data.categoryMapping || {});
                setCategoryBudgets(data.categoryBudgets || {});
                setIncomeTarget(data.incomeTarget || 0);
                setExpenseTarget(data.expenseTarget || 0);
                setIncomeSources(data.incomeSources || []);
            } else {
                // Migration: If Firestore is empty, check localStorage
                const savedBalance = localStorage.getItem('openingBalance');
                const savedGoals = localStorage.getItem('pillarGoals');
                const savedMapping = localStorage.getItem('categoryMapping');
                const savedBudgets = localStorage.getItem('categoryBudgets');
                const savedIncomeTarget = localStorage.getItem('incomeTarget');
                const savedExpenseTarget = localStorage.getItem('expenseTarget');
                const savedIncomeSources = localStorage.getItem('incomeSources');

                if (savedBalance || savedGoals || savedMapping || savedBudgets || savedIncomeTarget || savedExpenseTarget || savedIncomeSources) {
                    const initialData = {
                        openingBalance: savedBalance ? parseFloat(savedBalance) : 0,
                        pillarGoals: savedGoals ? JSON.parse(savedGoals) : { fixed: 0.65, investments: 0.15, guiltyFree: 0.15, emergency: 0.05 },
                        categoryMapping: savedMapping ? JSON.parse(savedMapping) : {},
                        categoryBudgets: savedBudgets ? JSON.parse(savedBudgets) : {},
                        incomeTarget: savedIncomeTarget ? parseFloat(savedIncomeTarget) : 0,
                        expenseTarget: savedExpenseTarget ? parseFloat(savedExpenseTarget) : 0,
                        incomeSources: savedIncomeSources ? JSON.parse(savedIncomeSources) : []
                    };

                    // Save to Firestore
                    await setDoc(docRef, initialData);
                    // State will be updated by the snapshot listener immediately after
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to save to Firestore
    const saveSettings = async (data: Partial<SettingsContextType>) => {
        const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
        // We use setDoc with merge: true to update only changed fields
        // But since we have separate states, we need to be careful.
        // Actually, simpler to just update the specific field in Firestore when state changes?
        // No, that causes infinite loops if we are not careful with the snapshot listener.
        // The snapshot listener updates state -> state change triggers effect -> writes to firestore -> snapshot listener fires...

        // Better approach: 
        // 1. The setters provided to consumers (setOpeningBalance, etc.) should update LOCAL state AND Firestore.
        // 2. The snapshot listener should update local state ONLY if it's different (to avoid loops, though React handles strict equality).
        // 3. Actually, if we write to Firestore, the snapshot comes back.

        // Let's wrap the setters to write to Firestore.
    };

    // Wrapped Setters
    const updateOpeningBalance = (value: number) => {
        setOpeningBalance(value); // Optimistic update
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { openingBalance: value }, { merge: true });
    };

    const updatePillarGoals = (goals: PillarGoals) => {
        setPillarGoals(goals);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { pillarGoals: goals }, { merge: true });
    };

    const updateCategoryMapping = (mapping: Record<string, Pilar>) => {
        setCategoryMapping(mapping);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { categoryMapping: mapping }, { merge: true });
    };

    const updateCategoryBudgets = (budgets: Record<string, number>) => {
        setCategoryBudgets(budgets);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { categoryBudgets: budgets }, { merge: true });
    };

    const updateIncomeTarget = (value: number) => {
        setIncomeTarget(value);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { incomeTarget: value }, { merge: true });
    };

    const updateExpenseTarget = (value: number) => {
        setExpenseTarget(value);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { expenseTarget: value }, { merge: true });
    };

    const updateIncomeSources = (sources: { id: string; name: string; amount: number }[]) => {
        setIncomeSources(sources);
        setDoc(doc(db, 'settings', SETTINGS_DOC_ID), { incomeSources: sources }, { merge: true });
    };

    return (
        <SettingsContext.Provider value={{
            openingBalance, setOpeningBalance: updateOpeningBalance,
            pillarGoals, setPillarGoals: updatePillarGoals,
            categoryMapping, setCategoryMapping: updateCategoryMapping,
            categoryBudgets, setCategoryBudgets: updateCategoryBudgets,
            incomeTarget, setIncomeTarget: updateIncomeTarget,
            expenseTarget, setExpenseTarget: updateExpenseTarget,
            incomeSources, setIncomeSources: updateIncomeSources
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
