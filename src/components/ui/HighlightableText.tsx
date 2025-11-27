'use client';

import { useSearch } from '@/context/SearchContext';

interface HighlightableTextProps {
    text: string;
    className?: string;
}

export default function HighlightableText({ text, className = '' }: HighlightableTextProps) {
    const { searchTerm } = useSearch();

    if (!searchTerm) {
        return <span className={className}>{text}</span>;
    }

    // Escape special characters for regex
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return (
        <span className={className}>
            {parts.map((part, i) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={i} className="bg-yellow-300 text-slate-900 font-bold rounded-sm px-0.5">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
}
