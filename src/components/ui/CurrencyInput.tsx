import React, { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps {
    value: number;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
}

export default function CurrencyInput({ value, onChange, className = '', placeholder }: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const isUserEditingRef = useRef(false);
    const lastPropValueRef = useRef<number | null>(null);

    useEffect(() => {
        // Only update display value from props if:
        // 1. User is not actively editing, OR
        // 2. The prop value changed from an external source (not from user input)
        const propValueChanged = lastPropValueRef.current !== value;

        console.log('CurrencyInput useEffect:', {
            value,
            lastPropValue: lastPropValueRef.current,
            propValueChanged,
            isUserEditing: isUserEditingRef.current,
            willUpdate: !isUserEditingRef.current || propValueChanged
        });

        if (!isUserEditingRef.current || propValueChanged) {
            if (value !== undefined && value !== null) {
                const formatted = formatCurrency(value);
                console.log('CurrencyInput: Setting display value to:', formatted);
                setDisplayValue(formatted);
                lastPropValueRef.current = value;
            }
        }
    }, [value]);

    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('CurrencyInput handleChange:', {
            inputValue: e.target.value,
            wasEditing: isUserEditingRef.current
        });

        isUserEditingRef.current = true;
        const inputValue = e.target.value;

        // Remove all non-digits
        const digits = inputValue.replace(/\D/g, '');

        // Convert to number (divide by 100 to handle cents)
        const numberValue = parseInt(digits || '0', 10) / 100;

        console.log('CurrencyInput: Parsed value:', { digits, numberValue });

        // Update display value immediately for smooth typing
        const formatted = formatCurrency(numberValue);
        setDisplayValue(formatted);

        // Update parent with the actual number
        onChange(numberValue);

        // Update our tracking ref
        lastPropValueRef.current = numberValue;
    };

    const handleBlur = () => {
        console.log('CurrencyInput: onBlur - stopping edit mode');
        // Reset editing flag when user leaves the field
        isUserEditingRef.current = false;
    };

    const handleFocus = () => {
        console.log('CurrencyInput: onFocus - starting edit mode');
        // Mark as editing when user focuses
        isUserEditingRef.current = true;
    };

    return (
        <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={className}
            placeholder={placeholder}
        />
    );
}
