import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Income, Expense, Loan, FutureExpense } from '../types';
import { 
  calculateTotalIncome, 
  calculatePaidExpenses, 
  calculateUnpaidExpenses,
  calculateRemainingBudget,
  calculateProjectedBalance,
  formatCurrency 
} from '../utils/calculations';

interface DashboardProps {
  incomes: Income[];
  expenses: Expense[];
  loans: Loan[];
  futureExpenses: FutureExpense[];
}

export const Dashboard: React.FC<DashboardProps> = ({ incomes, expenses, loans, futureExpenses }) => {
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  const unpaidExpenses = calculateUnpaidExpenses(expenses);
  const remainingBudget = calculateRemainingBudget(incomes, expenses);
  const projectedBalance = calculateProjectedBalance(incomes, expenses, loans, futureExpenses);

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
      title: 'Dépenses Payées',
      amount: paidExpenses,
      icon: CheckCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200'
    },
    {
      title: 'Budget Restant',
      amount: remainingBudget,
      icon: remainingBudget >= 0 ? Wallet : AlertCircle,
      color: remainingBudget >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: remainingBudget >= 0 ? 'bg-blue-50' : 'bg-red-50',
      border: remainingBudget >= 0 ? 'border-blue-200' : 'border-red-200'
    },
    {
      title: 'Dépenses Non Payées',
      amount: unpaidExpenses,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`${stat.bg} ${stat.border} border rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {formatCurrency(stat.amount)}
                  </p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Projection Mensuelle</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Solde Projeté</div>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(projectedBalance)}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Dépenses Restantes</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(unpaidExpenses)}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Taux d'Épargne</div>
            <div className={`text-2xl font-bold ${
              totalIncome > 0 && (remainingBudget / totalIncome) >= 0.2 ? 'text-green-600' : 
              totalIncome > 0 && (remainingBudget / totalIncome) >= 0.1 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {totalIncome > 0 ? ((remainingBudget / totalIncome) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};