import React from 'react';
import { Expense, CustomCategory, Income, Loan } from '../types';

interface ExpenseChartProps {
  expenses: Expense[];
  categories: CustomCategory[];
  incomes: Income[];
  loans: Loan[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyses</h2>
      <p className="text-gray-600">Graphiques et analyses des dépenses</p>
    </div>
  );
};
