'use client';

import { Menu, Search, Plus, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useMonth } from '@/context/MonthContext';
import { useSearch } from '@/context/SearchContext';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

export function Header() {
    const { selectedDate, nextMonth, prevMonth } = useMonth();
    const { searchTerm, setSearchTerm } = useSearch();
    const { toggleSidebar } = useSidebar();
    const { theme, toggleTheme } = useTheme();

    const formattedDate = selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Capitalize first letter
    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 sticky top-0 z-10 w-full">
            <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <Menu size={20} className="sm:w-6 sm:h-6" />
                </button>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <h2 className="text-sm sm:text-base md:text-xl font-semibold text-slate-800 dark:text-slate-100 w-28 sm:w-32 md:w-40 text-center truncate">{displayDate}</h2>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <Link href="/transactions/new" className="md:hidden p-2 bg-emerald-500 text-white rounded-full shadow-sm hover:bg-emerald-600 transition-colors">
                    <Plus size={18} />
                </Link>

                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none w-40 md:w-56 lg:w-64"
                    />
                </div>

                <Link href="/transactions/new" className="hidden md:flex items-center gap-2 bg-emerald-500 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
                    <Plus size={16} />
                    <span className="hidden lg:inline">Nova Transação</span>
                    <span className="lg:hidden">Nova</span>
                </Link>

                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    {theme === 'light' ? <Moon size={18} className="sm:w-5 sm:h-5" /> : <Sun size={18} className="sm:w-5 sm:h-5" />}
                </button>

                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm">
                    I
                </div>
            </div>
        </header>
    );
}
