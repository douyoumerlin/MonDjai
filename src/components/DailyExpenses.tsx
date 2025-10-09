import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingDown, Edit3, Save, X } from 'lucide-react';
import { BudgetLine, DailyExpense } from '../types';
import { formatCurrency } from '../utils/calculations';
import { supabase } from '../utils/supabase';

interface DailyExpensesProps {
  budgetLines: BudgetLine[];
  onDailyExpensesChange: () => void;
}

export const DailyExpenses: React.FC<DailyExpensesProps> = ({
  budgetLines,
  onDailyExpensesChange
}) => {
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [newExpense, setNewExpense] = useState({
    budgetLineId: budgetLines[0]?.id || '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDailyExpenses();
  }, []);

  const loadDailyExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('daily_expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (error) throw error;

      const formattedData: DailyExpense[] = (data || []).map((item: any) => ({
        id: item.id,
        budgetLineId: item.budget_line_id,
        amount: parseFloat(item.amount),
        description: item.description,
        expenseDate: item.expense_date,
        createdAt: item.created_at
      }));

      setDailyExpenses(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.budgetLineId || !newExpense.amount) return;

    try {
      const { data, error } = await supabase
        .from('daily_expenses')
        .insert([{
          budget_line_id: newExpense.budgetLineId,
          amount: parseFloat(newExpense.amount),
          description: newExpense.description,
          expense_date: newExpense.expenseDate
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedExpense: DailyExpense = {
        id: data.id,
        budgetLineId: data.budget_line_id,
        amount: parseFloat(data.amount),
        description: data.description,
        expenseDate: data.expense_date,
        createdAt: data.created_at
      };

      setDailyExpenses([formattedExpense, ...dailyExpenses]);
      setNewExpense({
        budgetLineId: budgetLines[0]?.id || '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);
      onDailyExpensesChange();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Supprimer cette dépense ?')) return;

    try {
      const { error } = await supabase
        .from('daily_expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDailyExpenses(dailyExpenses.filter(e => e.id !== id));
      onDailyExpensesChange();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const startEdit = (expense: DailyExpense) => {
    setEditingId(expense.id);
    setEditValues({
      budgetLineId: expense.budgetLineId,
      amount: expense.amount.toString(),
      description: expense.description,
      expenseDate: expense.expenseDate
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('daily_expenses')
        .update({
          budget_line_id: editValues.budgetLineId,
          amount: parseFloat(editValues.amount),
          description: editValues.description,
          expense_date: editValues.expenseDate
        })
        .eq('id', id);

      if (error) throw error;

      setDailyExpenses(dailyExpenses.map(e =>
        e.id === id ? {
          ...e,
          budgetLineId: editValues.budgetLineId,
          amount: parseFloat(editValues.amount),
          description: editValues.description,
          expenseDate: editValues.expenseDate
        } : e
      ));
      setEditingId(null);
      onDailyExpensesChange();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const getBudgetLineName = (budgetLineId: string): string => {
    const line = budgetLines.find(l => l.id === budgetLineId);
    return line ? line.description : 'Ligne supprimée';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-3 rounded-xl">
            <TrendingDown className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dépenses Journalières</h2>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="grid gap-4 mb-4">
            <select
              value={newExpense.budgetLineId}
              onChange={(e) => setNewExpense({ ...newExpense, budgetLineId: e.target.value })}
              className="px-4 py-3 border border-red-300 rounded-xl"
            >
              {budgetLines.map(line => (
                <option key={line.id} value={line.id}>
                  {line.description}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="px-4 py-3 border border-red-300 rounded-xl"
            />
            <input
              type="text"
              placeholder="Description"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              className="px-4 py-3 border border-red-300 rounded-xl"
            />
            <input
              type="date"
              value={newExpense.expenseDate}
              onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
              className="px-4 py-3 border border-red-300 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddExpense}
              className="flex-1 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
            >
              Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {dailyExpenses.map(expense => (
          <div
            key={expense.id}
            className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all"
          >
            {editingId === expense.id ? (
              <div className="space-y-3">
                <select
                  value={editValues.budgetLineId}
                  onChange={(e) => setEditValues({ ...editValues, budgetLineId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {budgetLines.map(line => (
                    <option key={line.id} value={line.id}>
                      {line.description}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={editValues.amount}
                  onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={editValues.expenseDate}
                  onChange={(e) => setEditValues({ ...editValues, expenseDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(expense.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg"
                  >
                    <Save size={16} />
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-300 rounded-lg"
                  >
                    <X size={16} />
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{expense.description || 'Sans description'}</p>
                    <p className="text-sm text-gray-600">{getBudgetLineName(expense.budgetLineId)}</p>
                    <p className="text-xs text-gray-500">{new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xl font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(expense)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
