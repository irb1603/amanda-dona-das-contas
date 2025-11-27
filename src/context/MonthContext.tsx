'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MonthContextType {
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    nextMonth: () => void;
    prevMonth: () => void;
}

const MonthContext = createContext<MonthContextType | undefined>(undefined);

export function MonthProvider({ children }: { children: ReactNode }) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + 1);
            return newDate;
        });
    };

    const prevMonth = () => {
        setSelectedDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() - 1);
            return newDate;
        });
    };

    return (
        <MonthContext.Provider value={{ selectedDate, setSelectedDate, nextMonth, prevMonth }}>
            {children}
        </MonthContext.Provider>
    );
}

export function useMonth() {
    const context = useContext(MonthContext);
    if (context === undefined) {
        throw new Error('useMonth must be used within a MonthProvider');
    }
    return context;
}
