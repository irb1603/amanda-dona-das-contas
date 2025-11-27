import Link from 'next/link';
import { Home, CreditCard, DollarSign, Repeat, PieChart, Upload } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/' },
    { name: 'Cartão de Crédito', icon: CreditCard, href: '/credit-card' },
    { name: 'Despesas Avulsas', icon: DollarSign, href: '/expenses' },
    { name: 'Despesas Fixas', icon: Repeat, href: '/recurring' },
    { name: 'Importar Dados', icon: Upload, href: '/import' },
];

export function Sidebar() {
    return (
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-emerald-400">Finanças</h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
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
    );
}
