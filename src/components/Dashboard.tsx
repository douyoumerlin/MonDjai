import React from 'react';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Receipt } from 'lucide-react';
import { Income, Expense, Loan, FutureExpense, BudgetLine, DailyExpense } from '../types';
import {
  calculateTotalIncome,
  calculatePaidExpenses,
  calculateUnpaidExpenses,
  calculateRemainingBudgetWithLoans,
  calculateProjectedBalance,
  formatCurrency
} from '../utils/calculations';

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  futureExpenses: FutureExpense[];
  budgetLines: BudgetLine[];
  dailyExpenses: DailyExpense[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  incomes,
  expenses,
  loans,
  futureExpenses,
  budgetLines,
  dailyExpenses
}) => {
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  const unpaidExpenses = calculateUnpaidExpenses(expenses);
  const remainingBudget = calculateRemainingBudgetWithLoans(incomes, expenses, loans);
  const projectedBalance = calculateProjectedBalance(incomes, expenses, loans, futureExpenses);

  const totalBudgetPlanned = budgetLines.reduce((sum, line) => sum + line.plannedAmount, 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetRemaining = totalBudgetPlanned - totalDailyExpenses;

  const stats = [
    {
      title: 'Revenus Totaux',
      amount: totalIncome,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200'
    },
    {
      title: 'Budget Planifié',
      amount: totalBudgetPlanned,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200'
    },
    {
      title: 'Dépenses Effectuées',
      amount: totalDailyExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: 'Budget Restant',
      amount: budgetRemaining,
      icon: budgetRemaining >= 0 ? Wallet : AlertCircle,
      color: budgetRemaining >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: budgetRemaining >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border: budgetRemaining >= 0 ? 'border-blue-200' : 'border-red-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bg} ${stat.border} border rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-lg sm:text-xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.amount)}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl ${stat.bg} shadow-sm`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
