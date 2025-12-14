'use client';

import Link from 'next/link';
import { Home, CreditCard, DollarSign, Repeat, PieChart, Upload } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Cartão de Crédito', icon: CreditCard, href: '/credit-card' },
    { name: 'Débito', icon: CreditCard, href: '/debit' }, // Using CreditCard icon for now, or maybe Wallet?
    { name: 'Despesas Avulsas', icon: DollarSign, href: '/expenses' },
    { name: 'Despesas Fixas', icon: Repeat, href: '/recurring' },
    { name: 'Importar Dados', icon: Upload, href: '/import' },
];

import { useSidebar } from '@/context/SidebarContext';

export function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white overflow-y-auto z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-emerald-400">Finanças</h1>
                    <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
                        {/* Close icon could go here, but clicking outside works too */}
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={closeSidebar} // Close on navigation
                            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 rounded-lg transition-colors"
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500 text-center">
                        &copy; 2025 App Financeiro
                    </div>
                </div>
            </aside>
        </>
    );
}
