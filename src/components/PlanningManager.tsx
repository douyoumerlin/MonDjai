import React from 'react';
import { Loan, FutureExpense, CustomCategory } from '../types';

interface PlanningManagerProps {
  loans: Loan[];
  futureExpenses: FutureExpense[];
  categories: CustomCategory[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'date'>) => void;
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
  onAddFutureExpense: (expense: Omit<FutureExpense, 'id'>) => void;
  onUpdateFutureExpense: (id: string, updates: Partial<FutureExpense>) => void;
  onDeleteFutureExpense: (id: string) => void;
}

export const PlanningManager: React.FC<PlanningManagerProps> = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Planification</h2>
      <p className="text-gray-600">Section de planification des prêts et dépenses futures</p>
    </div>
  );
};
