import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, TrendingUp } from 'lucide-react';
import { Income } from '../types';
import { formatCurrency } from '../utils/calculations';

interface IncomeFormProps {
  incomes: Income[];
  onAddIncome: (income: Omit<Income, 'id' | 'date'>) => void;
  onUpdateIncome: (id: string, updates: Partial<Income>) => void;
  onDeleteIncome: (id: string) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  incomes,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome
}) => {
  const [newIncome, setNewIncome] = useState({ source: '', amount: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ source: string; amount: string }>({
    source: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.source || !newIncome.amount) return;

    onAddIncome({
      source: newIncome.source,
      amount: parseFloat(newIncome.amount)
    });
    setNewIncome({ source: '', amount: '' });
    setIsAdding(false);
  };

  const startEdit = (income: Income) => {
    setEditingId(income.id);
    setEditValues({
      source: income.source,
      amount: income.amount.toString()
    });
  };

  const saveEdit = (id: string) => {
    onUpdateIncome(id, {
      source: editValues.source,
      amount: parseFloat(editValues.amount)
    });
    setEditingId(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <TrendingUp className="text-emerald-600" size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Mes Revenus</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Source de revenu"
              value={newIncome.source}
              onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
              className="px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Montant"
              value={newIncome.amount}
              onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
              className="px-4 py-3 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewIncome({ source: '', amount: '' });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {incomes.map((income) => (
          <div
            key={income.id}
            className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 hover:shadow-md transition-all"
          >
            {editingId === income.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editValues.source}
                  onChange={(e) => setEditValues({ ...editValues, source: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg"
                />
                <input
                  type="number"
                  value={editValues.amount}
                  onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-300 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(income.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    <Save size={16} />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{income.source}</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(income.amount)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(income)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteIncome(income.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
