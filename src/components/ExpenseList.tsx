import React, { useState } from 'react';
import { Expense, CustomCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  categories: CustomCategory[];
  onToggleExpense: (id: string) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCategory: (category: Omit<CustomCategory, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<CustomCategory>) => void;
  onDeleteCategory: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onToggleExpense,
  onAddExpense,
  onDeleteExpense
}) => {
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: categories[0]?.name || ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    onAddExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      isPaid: false
    });
    setNewExpense({ description: '', amount: '', category: categories[0]?.name || '' });
    setIsAdding(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dépenses</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            <Plus size={20} />
            Ajouter
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-red-50 rounded-xl">
          <div className="grid gap-4 mb-4">
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="px-4 py-3 border rounded-xl"
            />
            <input
              type="number"
              placeholder="Montant"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="px-4 py-3 border rounded-xl"
            />
            <select
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="px-4 py-3 border rounded-xl"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-xl">
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-300 rounded-xl"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => onToggleExpense(expense.id)}>
                {expense.isPaid ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : (
                  <Circle className="text-gray-400" size={24} />
                )}
              </button>
              <div>
                <p className="font-semibold">{expense.description}</p>
                <p className="text-sm text-gray-600">{expense.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-bold">{formatCurrency(expense.amount)}</p>
              <button
                onClick={() => onDeleteExpense(expense.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
