'use client';

import { Menu, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMonth } from '@/context/MonthContext';
import { useSearch } from '@/context/SearchContext';

export function Header() {
    const { selectedDate, nextMonth, prevMonth } = useMonth();
    const { searchTerm, setSearchTerm } = useSearch();

    const formattedDate = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Capitalize first letter
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 md:ml-64">
            <div className="flex items-center gap-4">
                <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-semibold text-slate-800 w-40 text-center">{displayDate}</h2>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link href="/transactions/new" className="md:hidden p-2 bg-emerald-500 text-white rounded-full shadow-sm hover:bg-emerald-600 transition-colors">
                    <Plus size={20} />
                </Link>

                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm font-medium text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none w-64"
                    />
                </div>

                <Link href="/transactions/new" className="hidden md:flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
                    <Plus size={16} />
                    Nova Transação
                </Link>

                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
                    I
                </div>
            </div>
        </header>
    );
}
