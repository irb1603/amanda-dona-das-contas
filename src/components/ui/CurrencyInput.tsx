import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
}

export default function CurrencyInput({ value, onChange, className = '', placeholder }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        // Format initial value
        if (value !== undefined && value !== null) {
            setDisplayValue(formatCurrency(value));
        }
    }, [value]);

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Remove all non-digits
        const digits = inputValue.replace(/\D/g, '');

        // Convert to number (divide by 100 to handle cents)
        const numberValue = parseInt(digits || '0', 10) / 100;

        // Update parent with the actual number
        onChange(numberValue);

        // Update display with formatted string
        // We don't update displayValue here directly because the useEffect will handle it
        // based on the new 'value' prop coming back, BUT for smooth typing we might want to.
        // However, relying on prop update is safer for consistency.
        // Actually, for inputs, local state is often better to avoid cursor jumping, 
        // but for a simple mask where the entire string is replaced, it's tricky.
        // Let's rely on the prop update cycle for simplicity first.
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
}
