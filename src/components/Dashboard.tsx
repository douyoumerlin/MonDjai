import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { Income, Expense } from '../types';
import { calculateTotalIncome, calculateTotalExpenses, calculateBalance, formatCurrency } from '../utils/calculations';

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ incomes, expenses }) => {
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const balance = calculateBalance(incomes, expenses);

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
      title: 'Dépenses Totales',
      amount: totalExpenses,
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: 'Solde Restant',
      amount: balance,
      icon: balance >= 0 ? Wallet : PieChart,
      color: balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: balance >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border: balance >= 0 ? 'border-blue-200' : 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bg} ${stat.border} border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {formatCurrency(stat.amount)}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg ${stat.bg}`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};