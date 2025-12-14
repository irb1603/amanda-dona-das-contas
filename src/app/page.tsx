'use client';

import { useState } from 'react';
import Image from "next/image";

import { useTransactions } from '@/hooks/useTransactions';
import { useAccumulatedBalance } from '@/hooks/useAccumulatedBalance';
import { useRecentTransactions } from '@/hooks/useRecentTransactions';
import { useMonth } from '@/context/MonthContext';
import { useSettings } from '@/context/SettingsContext';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Edit2, Settings, Tag, ChevronLeft, ChevronRight, Wallet, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import EditTransactionModal from '@/components/transactions/EditTransactionModal';
import SettingsModal from '@/components/settings/SettingsModal';
import EditBalanceModal from '@/components/dashboard/EditBalanceModal';
import EditTargetModal from '@/components/dashboard/EditTargetModal';
import EditIncomeSourcesModal from '@/components/dashboard/EditIncomeSourcesModal';
import EditIncomeModal from '@/components/dashboard/EditIncomeModal';
import DuplicateDetectorModal from '@/components/transactions/DuplicateDetectorModal';
import HighlightableText from '@/components/ui/HighlightableText';
import EditExpenseSummaryModal from '@/components/dashboard/EditExpenseSummaryModal';
import { Transaction } from '@/types';

export default function Home() {
  const { selectedDate, nextMonth, prevMonth } = useMonth();
  const { openingBalance, pillarGoals, incomeTarget, expenseTarget, incomeSources, expenseOverrides, categoryMapping, categoryBudgets } = useSettings();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth() + 1; // 1-12

  const { transactions, loading, error, income, expense, balance, pillars } = useTransactions(currentYear, currentMonth);

  // Get accumulated balance up to current month (not including current month)
  const { accumulatedBalance: previousMonthBalance } = useAccumulatedBalance(currentYear, currentMonth);

  // Get recent transactions across all months for dashboard cards
  const { allTransactions: recentTransactions, creditCardTransactions: recentCreditCardTransactions } = useRecentTransactions(10);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isIncomeSourcesModalOpen, setIsIncomeSourcesModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isDuplicateDetectorOpen, setIsDuplicateDetectorOpen] = useState(false);
  const [isExpenseSummaryModalOpen, setIsExpenseSummaryModalOpen] = useState(false);
  const [editTargetModal, setEditTargetModal] = useState<{ isOpen: boolean; type: 'income' | 'expense' }>({ isOpen: false, type: 'income' });
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const currentBalance = previousMonthBalance + (income - expense);

  // 4 Pillars Logic - use income or 1 to avoid division by zero
  const safeIncome = income > 0 ? income : 1;
  const limits = {
    fixed: safeIncome * pillarGoals.fixed,
    investments: safeIncome * pillarGoals.investments,
    guiltyFree: safeIncome * pillarGoals.guiltyFree,
    emergency: safeIncome * pillarGoals.emergency,
  };

  // Calculate expenses by category for each pilar
  const categoryExpenses: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.type === 'expense') {
      let pilar = t.pilar;
      if (categoryMapping[t.category]) {
        pilar = categoryMapping[t.category];
      }
      if (pilar) {
        const key = `${pilar}::${t.category}`;
        categoryExpenses[key] = (categoryExpenses[key] || 0) + t.amount;
      }
    }
  });

  // Calculate Expense Breakdowns
  const calculatedExpenses = {
    dux: transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'credit_card' && t.cardSource === 'Cartão DUX')
      .reduce((sum, t) => sum + t.amount, 0),
    c6: transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'credit_card' && t.cardSource === 'Cartão C6')
      .reduce((sum, t) => sum + t.amount, 0),
    debit: transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'debit_card')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  // Use overrides if present
  const displayExpenses = {
    dux: expenseOverrides.dux !== null ? expenseOverrides.dux : calculatedExpenses.dux,
    c6: expenseOverrides.c6 !== null ? expenseOverrides.c6 : calculatedExpenses.c6,
    debit: expenseOverrides.debit !== null ? expenseOverrides.debit : calculatedExpenses.debit,
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
    <div className="space-y-8 pb-24">
      {/* Header with Month Selector and Settings */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
            <p className="text-slate-500">Acompanhe suas finanças</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={24} className="text-slate-600" />
              </button>
              <div className="flex flex-col items-center min-w-[120px]">
                <span className="text-lg font-bold text-slate-800 capitalize">
                  {selectedDate.toLocaleString('pt-BR', { month: 'long' })}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedDate.getFullYear()}
                </span>
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight size={24} className="text-slate-600" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDuplicateDetectorOpen(true)}
                className="flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
                title="Detectar duplicatas"
              >
                <Copy size={18} />
                <span className="text-sm font-medium hidden sm:inline">Duplicatas</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Saldo Atual */}
        <div
          onClick={() => setIsBalanceModalOpen(true)}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-emerald-200 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Wallet className="text-emerald-600" size={24} />
            </div>
            <div className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <Edit2 size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Saldo Atual</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
          </div>
        </div>

        {/* Card 2: Receitas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Receitas</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {income.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Saldo mês anterior: {previousMonthBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setIsIncomeModalOpen(true)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              >
                <Edit2 size={12} />
                Editar Valor
              </button>
              <button
                onClick={() => setIsIncomeSourcesModalOpen(true)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 border border-blue-200"
              >
                <Settings size={12} />
                Fontes
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Despesas */}
        <div
          onClick={() => setEditTargetModal({ isOpen: true, type: 'expense' })}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:border-red-200 transition-colors group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div className="p-2 hover:bg-slate-50 rounded-full transition-colors">
              <Edit2 size={16} className="text-slate-300 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Despesas</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {expense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Teto: {expenseTarget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpenseSummaryModalOpen(true); }}
                className="p-2 hover:bg-slate-50 rounded-lg text-emerald-600 font-medium text-xs flex items-center gap-1"
              >
                <Edit2 size={12} /> Resumo
              </button>
            </div>

            {/* Expense Breakdown Summary */}
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cartão DUX:</span>
                <span className={`font-medium ${expenseOverrides.dux !== null ? 'text-amber-600' : 'text-slate-700'}`}>
                  {displayExpenses.dux.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cartão C6:</span>
                <span className={`font-medium ${expenseOverrides.c6 !== null ? 'text-amber-600' : 'text-slate-700'}`}>
                  {displayExpenses.c6.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Débito:</span>
                <span className={`font-medium ${expenseOverrides.debit !== null ? 'text-amber-600' : 'text-slate-700'}`}>
                  {displayExpenses.debit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

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
              {recentCreditCardTransactions
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
              {recentCreditCardTransactions.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhuma compra no cartão.</p>
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
              <div className="cursor-pointer" onClick={() => setExpandedPillar(expandedPillar === 'Despesas Fixas' ? null : 'Despesas Fixas')}>
                <div className="flex justify-between text-sm mb-1 items-center">
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    Despesas Fixas (Meta: {(pillarGoals.fixed * 100).toFixed(0)}%)
                    {expandedPillar === 'Despesas Fixas' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                  <span className={pillars['Despesas Fixas'] > limits.fixed ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Despesas Fixas'] / limits.fixed) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Despesas Fixas'] > limits.fixed ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Despesas Fixas'] / limits.fixed) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gasto: {pillars['Despesas Fixas'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / Teto: {limits.fixed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {expandedPillar === 'Despesas Fixas' && (
                  <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                    {Object.entries(categoryExpenses)
                      .filter(([key]) => key.startsWith('Despesas Fixas::'))
                      .map(([key, spent]) => {
                        const category = key.split('::')[1];
                        const categoryLimit = categoryBudgets[category] || 0;
                        return (
                          <div key={key} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">{category}</span>
                              <span className={spent > categoryLimit && categoryLimit > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                                {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                {categoryLimit > 0 && ` / ${categoryLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </span>
                            </div>
                            {categoryLimit > 0 && (
                              <div className="w-full bg-slate-50 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${spent > categoryLimit ? 'bg-red-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${Math.min((spent / categoryLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Guilty-free */}
              <div className="cursor-pointer" onClick={() => setExpandedPillar(expandedPillar === 'Guilty-free' ? null : 'Guilty-free')}>
                <div className="flex justify-between text-sm mb-1 items-center">
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    Lazer / Guilty-free (Meta: {(pillarGoals.guiltyFree * 100).toFixed(0)}%)
                    {expandedPillar === 'Guilty-free' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                  <span className={pillars['Guilty-free'] > limits.guiltyFree ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Guilty-free'] / limits.guiltyFree) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Guilty-free'] > limits.guiltyFree ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Guilty-free'] / limits.guiltyFree) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gasto: {pillars['Guilty-free'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / Teto: {limits.guiltyFree.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {expandedPillar === 'Guilty-free' && (
                  <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                    {Object.entries(categoryExpenses)
                      .filter(([key]) => key.startsWith('Guilty-free::'))
                      .map(([key, spent]) => {
                        const category = key.split('::')[1];
                        const categoryLimit = categoryBudgets[category] || 0;
                        return (
                          <div key={key} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">{category}</span>
                              <span className={spent > categoryLimit && categoryLimit > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                                {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                {categoryLimit > 0 && ` / ${categoryLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </span>
                            </div>
                            {categoryLimit > 0 && (
                              <div className="w-full bg-slate-50 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${spent > categoryLimit ? 'bg-red-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${Math.min((spent / categoryLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Investments */}
              <div className="cursor-pointer" onClick={() => setExpandedPillar(expandedPillar === 'Investimentos' ? null : 'Investimentos')}>
                <div className="flex justify-between text-sm mb-1 items-center">
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    Investimentos (Meta: {(pillarGoals.investments * 100).toFixed(0)}%)
                    {expandedPillar === 'Investimentos' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                  <span className={pillars['Investimentos'] < limits.investments ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Investimentos'] / limits.investments) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${Math.min((pillars['Investimentos'] / limits.investments) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gasto: {pillars['Investimentos'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / Teto: {limits.investments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {expandedPillar === 'Investimentos' && (
                  <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-2">
                    {Object.entries(categoryExpenses)
                      .filter(([key]) => key.startsWith('Investimentos::'))
                      .map(([key, spent]) => {
                        const category = key.split('::')[1];
                        const categoryLimit = categoryBudgets[category] || 0;
                        return (
                          <div key={key} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">{category}</span>
                              <span className={spent > categoryLimit && categoryLimit > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                                {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                {categoryLimit > 0 && ` / ${categoryLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </span>
                            </div>
                            {categoryLimit > 0 && (
                              <div className="w-full bg-slate-50 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${spent > categoryLimit ? 'bg-red-400' : 'bg-blue-400'}`}
                                  style={{ width: `${Math.min((spent / categoryLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Emergency / Imprevistos */}
              <div className="cursor-pointer" onClick={() => setExpandedPillar(expandedPillar === 'Imprevistos' ? null : 'Imprevistos')}>
                <div className="flex justify-between text-sm mb-1 items-center">
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    Imprevistos (Meta: {(pillarGoals.emergency * 100).toFixed(0)}%)
                    {expandedPillar === 'Imprevistos' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                  <span className={pillars['Imprevistos'] > limits.emergency ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {((pillars['Imprevistos'] / limits.emergency) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${pillars['Imprevistos'] > limits.emergency ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min((pillars['Imprevistos'] / limits.emergency) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gasto: {pillars['Imprevistos'].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / Teto: {limits.emergency.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                {expandedPillar === 'Imprevistos' && (
                  <div className="mt-3 pl-4 border-l-2 border-emerald-200 space-y-2">
                    {Object.entries(categoryExpenses)
                      .filter(([key]) => key.startsWith('Imprevistos::'))
                      .map(([key, spent]) => {
                        const category = key.split('::')[1];
                        const categoryLimit = categoryBudgets[category] || 0;
                        return (
                          <div key={key} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span className="text-slate-600">{category}</span>
                              <span className={spent > categoryLimit && categoryLimit > 0 ? 'text-red-600 font-semibold' : 'text-slate-700'}>
                                {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                {categoryLimit > 0 && ` / ${categoryLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                              </span>
                            </div>
                            {categoryLimit > 0 && (
                              <div className="w-full bg-slate-50 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full ${spent > categoryLimit ? 'bg-red-400' : 'bg-emerald-400'}`}
                                  style={{ width: `${Math.min((spent / categoryLimit) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Últimas Transações</h3>
            <div className="space-y-3">
              {recentTransactions.map((t) => (
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
              {recentTransactions.length === 0 && (
                <p className="text-center text-slate-500 py-4">Nenhuma transação.</p>
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

      <EditTargetModal
        isOpen={editTargetModal.isOpen}
        onClose={() => setEditTargetModal({ isOpen: false, type: 'income' })}
        type={editTargetModal.type}
      />

      <EditIncomeSourcesModal
        isOpen={isIncomeSourcesModalOpen}
        onClose={() => setIsIncomeSourcesModalOpen(false)}
      />

      <EditIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        currentIncome={income}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />

      <DuplicateDetectorModal
        isOpen={isDuplicateDetectorOpen}
        onClose={() => setIsDuplicateDetectorOpen(false)}
        transactions={transactions.filter(t => t.id) as (Transaction & { id: string })[]}
        onUpdate={() => window.location.reload()}
      />

      <EditExpenseSummaryModal
        isOpen={isExpenseSummaryModalOpen}
        onClose={() => setIsExpenseSummaryModalOpen(false)}
        calculatedValues={calculatedExpenses}
      />
    </div>
  );
}
