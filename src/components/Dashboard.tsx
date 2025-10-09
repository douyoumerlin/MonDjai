import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Clock, CheckCircle, AlertCircle, Receipt } from 'lucide-react';
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

export const Dashboard: React.FC<DashboardProps> = ({ incomes, expenses, loans, futureExpenses, budgetLines, dailyExpenses }) => {
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  const unpaidExpenses = calculateUnpaidExpenses(expenses);
  const remainingBudget = calculateRemainingBudgetWithLoans(incomes, expenses, loans);
  const projectedBalance = calculateProjectedBalance(incomes, expenses, loans, futureExpenses);

  const totalBudgetPlanned = budgetLines.reduce((sum, line) => sum + line.plannedAmount, 0);
  const totalDailyExpenses = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetRemaining = totalBudgetPlanned - totalDailyExpenses;

  const linesWithWarnings = budgetLines.filter(line => {
    const spent = dailyExpenses
      .filter(e => e.budgetLineId === line.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = line.plannedAmount > 0 ? (spent / line.plannedAmount) * 100 : 0;
    return percentage >= 80;
  }).length;

  const stats = [
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
      color: budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: budgetRemaining >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      border: budgetRemaining >= 0 ? 'border-emerald-200' : 'border-red-200'
    },
    {
      title: 'Lignes en Alerte',
      amount: linesWithWarnings,
      icon: linesWithWarnings > 0 ? AlertCircle : CheckCircle,
      color: linesWithWarnings > 0 ? 'text-orange-600' : 'text-green-600',
      bg: linesWithWarnings > 0 ? 'bg-orange-50' : 'bg-green-50',
      border: linesWithWarnings > 0 ? 'border-orange-200' : 'border-green-200',
      isCount: true
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
                    {stat.isCount ? stat.amount : formatCurrency(stat.amount)}
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

      {/* Statistiques Budget */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vue d'Ensemble Budget</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Taux d'Utilisation</div>
            <div className={`text-xl sm:text-2xl font-bold ${
              totalBudgetPlanned > 0 && (totalDailyExpenses / totalBudgetPlanned) >= 0.8 ? 'text-red-600' :
              totalBudgetPlanned > 0 && (totalDailyExpenses / totalBudgetPlanned) >= 0.5 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {totalBudgetPlanned > 0 ? ((totalDailyExpenses / totalBudgetPlanned) * 100).toFixed(1) : '0.0'}%
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Lignes Budgétaires</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {budgetLines.length}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Dépenses Journalières</div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {dailyExpenses.length}
            </div>
          </div>
        </div>
      </div>
      {/* Alertes */}
      {linesWithWarnings > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-orange-600 flex-shrink-0" size={24} />
            <div>
              <h4 className="font-semibold text-orange-900 mb-1">Attention Budget</h4>
              <p className="text-sm text-orange-800">
                {linesWithWarnings} ligne{linesWithWarnings > 1 ? 's' : ''} budgétaire{linesWithWarnings > 1 ? 's' : ''} {linesWithWarnings > 1 ? 'ont' : 'a'} atteint ou dépassé 80% du budget prévu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};