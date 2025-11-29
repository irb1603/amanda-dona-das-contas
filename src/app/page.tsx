'use client';

import { useState } from 'react';
import Image from "next/image";

import { useTransactions } from '@/hooks/useTransactions';
import { useMonth } from '@/context/MonthContext';
import { useSettings } from '@/context/SettingsContext';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Edit2, Settings, Tag } from 'lucide-react';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import SettingsModal from '@/components/settings/SettingsModal';
import EditBalanceModal from '@/components/dashboard/EditBalanceModal';
import HighlightableText from '@/components/ui/HighlightableText';
import { Transaction } from '@/types';

export default function Home() {
  const { selectedDate } = useMonth();
  const { openingBalance, pillarGoals, incomeTarget, expenseTarget, incomeSources } = useSettings();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth() + 1; // 1-12

  const { transactions, loading, error, income, expense, balance, pillars } = useTransactions(currentYear, currentMonth);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const currentBalance = openingBalance + balance;

  // 4 Pillars Logic
  const limits = {
    fixed: income * pillarGoals.fixed,
    investments: income * pillarGoals.investments,
    guiltyFree: income * pillarGoals.guiltyFree,
    emergency: income * pillarGoals.emergency,
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center p-4">
        <AlertCircle className="text-red-500" size={48} />
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-800">Erro de Conexão</h3>
          <p className="text-slate-600">{error}</p>
          <p className="text-sm text-slate-500">Verifique se o Firestore Database foi criado no Console do Firebase.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Configurações</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo (Balanço do Mês) */}
        <div
          onClick={() => setIsBalanceModalOpen(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors group"
        >
          <div className="flex justify-between items-start">
            <p className="text-sm text-slate-600 mb-1 font-medium">Saldo Atual (Inicial + Mês)</p>
            <Edit2 size={14} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
          <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Inicial: {openingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        {/* Card 2: Receitas */}
        <div
          onClick={() => setIsSettingsOpen(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors group"
        >
          <div className="flex justify-between items-start">
            <p className="text-sm text-slate-600 mb-1 font-medium">Receitas</p>
            <Edit2 size={14} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            <p className="text-2xl font-bold text-slate-800">
              {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          {/* Income Sources Preview */}
          <div className="mt-3 space-y-1">
            {incomeSources.slice(0, 3).map(source => (
              <div key={source.id} className="flex justify-between text-[10px] text-slate-500">
                <span>{source.name}</span>
                <span>{source.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            ))}
            {incomeSources.length > 3 && (
              <p className="text-[10px] text-slate-400 text-center">+ {incomeSources.length - 3} outras fontes</p>
            )}
            {incomeSources.length === 0 && incomeTarget > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${Math.min((income / incomeTarget) * 100, 100)}%` }}
                ></div>
                <p className="text-[10px] text-slate-400 mt-1 text-right">Meta: {incomeTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Despesas */}
        <div
          onClick={() => setIsSettingsOpen(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors group"
        >
          <div className="flex justify-between items-start">
            <p className="text-sm text-slate-600 mb-1 font-medium">Despesas</p>
            <Edit2 size={14} className="text-slate-300 group-hover:text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown size={20} className="text-red-500" />
            <p className="text-2xl font-bold text-slate-800">
              {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          {expenseTarget > 0 && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div
                className={`h-1.5 rounded-full ${expense > expenseTarget ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((expense / expenseTarget) * 100, 100)}%` }}
              ></div>
              <p className="text-[10px] text-slate-400 mt-1 text-right">Teto: {expenseTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          )}
        </div>

        {/* Card 4: Insight (Maior Gasto - Simplificado para Pilar mais alto) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
          <p className="text-sm text-indigo-700 font-semibold mb-1">Gastos por Pilar</p>
          <div className="text-xs space-y-1 mt-2">
            {Object.entries(pillars).map(([pilar, amount]) => (
              <div key={pilar} className="flex justify-between text-slate-700">
                <span>{pilar}</span>
                <span className="font-bold">{amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left Column: Credit Card & Pillars */}
        <div className="space-y-6">
          {/* Recent Credit Card Transactions (Moved here) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Cartão de Crédito (Recentes)</h3>
            <div className="space-y-3">
              {transactions
                .filter(t => t.paymentMethod === 'credit_card')
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleTransactionClick(t)}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600">
                        <TrendingDown size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          <HighlightableText text={t.description} />
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Tag size={10} />
                          <HighlightableText text={t.category} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-700">
                          {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        {t.totalInstallments && (
                          <p className="text-xs text-slate-500">{t.installmentIndex}/{t.totalInstallments}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {transactions.filter(t => t.paymentMethod === 'credit_card').length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhuma compra no cartão neste mês.</p>
              )}
            </div>
          </div>

          {/* 4 Pillars Analysis (Moved here) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Análise dos 4 Pilares</h3>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                <Edit2 size={12} /> Editar Metas
              </button>
            </div>

            <div className="space-y-4">
              {/* Fixed Expenses */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">Despesas Fixas (Meta: {(pillarGoals.fixed * 100).toFixed(0)}%)</span>
                  <span className={pillars['Despesas Fixas'] > limits.fixed ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Despesas Fixas'] / (income || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Despesas Fixas'] > limits.fixed ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Despesas Fixas'] / (income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gasto: {pillars['Despesas Fixas'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / Teto: {limits.fixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              {/* Guilty-free */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">Lazer / Guilty-free (Meta: {(pillarGoals.guiltyFree * 100).toFixed(0)}%)</span>
                  <span className={pillars['Guilty-free'] > limits.guiltyFree ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Guilty-free'] / (income || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Guilty-free'] > limits.guiltyFree ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Guilty-free'] / (income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Investments */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">Investimentos (Meta: {(pillarGoals.investments * 100).toFixed(0)}%)</span>
                  <span className={pillars['Investimentos'] < limits.investments ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Investimentos'] / (income || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.min((pillars['Investimentos'] / (income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Emergency / Imprevistos */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">Imprevistos (Meta: {(pillarGoals.emergency * 100).toFixed(0)}%)</span>
                  <span className={pillars['Imprevistos'] > limits.emergency ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Imprevistos'] / (income || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Imprevistos'] > limits.emergency ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Imprevistos'] / (income || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Últimas Transações</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleTransactionClick(t)}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.category} • {t.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {t.totalInstallments && (
                      <p className="text-xs text-slate-500">{t.installmentIndex}/{t.totalInstallments}</p>
                    )}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhuma transação neste mês.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditTransactionModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => { }} // Real-time listener handles updates
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <EditBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        currentBalance={currentBalance}
        monthlyBalance={balance}
      />
    </div>
  );
}
