import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, TrendingDown, AlertCircle } from 'lucide-react';
import { BudgetLine, DailyExpense } from '../types';
import { formatCurrency } from '../utils/calculations';
import { supabase } from '../utils/supabase';

interface DailyExpensesProps {
  budgetLines: BudgetLine[];
  onDailyExpensesChange?: () => void;
}

export const DailyExpenses: React.FC<DailyExpensesProps> = ({ budgetLines, onDailyExpensesChange }) => {
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    budgetLineId: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadDailyExpenses();
  }, []);

  const loadDailyExpenses = async () => {
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
      console.error('Erreur lors du chargement des dépenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.budgetLineId || !newExpense.amount || !newExpense.description) return;

    const budgetLine = budgetLines.find(bl => bl.id === newExpense.budgetLineId);
    if (!budgetLine) return;

    const currentTotal = dailyExpenses
      .filter(e => e.budgetLineId === newExpense.budgetLineId)
      .reduce((sum, e) => sum + e.amount, 0);

    const newTotal = currentTotal + parseFloat(newExpense.amount);
    const percentage = (newTotal / budgetLine.plannedAmount) * 100;

    if (percentage >= 100) {
      alert(`Budget atteint pour "${budgetLine.description}". Impossible d'ajouter cette dépense.`);
      return;
    }

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
        budgetLineId: '',
        amount: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0]
      });
      setIsAdding(false);

      if (onDailyExpensesChange) {
        onDailyExpensesChange();
      }

      if (percentage + (parseFloat(newExpense.amount) / budgetLine.plannedAmount) * 100 >= 80) {
        alert(`⚠️ Attention: Le budget "${budgetLine.description}" est à ${percentage.toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout de la dépense');
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

      if (onDailyExpensesChange) {
        onDailyExpensesChange();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getBudgetLineName = (budgetLineId: string) => {
    const line = budgetLines.find(bl => bl.id === budgetLineId);
    return line ? `${line.description} (${line.category})` : 'Ligne supprimée';
  };

  const groupExpensesByMonth = () => {
    const grouped: { [key: string]: DailyExpense[] } = {};
    dailyExpenses.forEach(expense => {
      const month = new Date(expense.expenseDate).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
      });
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(expense);
    });
    return grouped;
  };

  const groupedExpenses = groupExpensesByMonth();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="text-center py-12">
          <div className="text-gray-400">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="text-red-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Dépenses Journalières</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={budgetLines.length === 0}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {budgetLines.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Aucune ligne budgétaire</p>
              <p>Créez d'abord des lignes budgétaires dans l'onglet "Dépenses" pour pouvoir enregistrer vos dépenses journalières.</p>
            </div>
          </div>
        </div>
      )}

      {isAdding && budgetLines.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouvelle Dépense Journalière</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ligne Budgétaire</label>
              <select
                value={newExpense.budgetLineId}
                onChange={(e) => setNewExpense({ ...newExpense, budgetLineId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {budgetLines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.description} - {line.category} ({formatCurrency(line.plannedAmount)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Achat supermarché, Plein d'essence..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newExpense.expenseDate}
                  onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddExpense}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📅</div>
            <p className="text-gray-500">Aucune dépense enregistrée</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez vos premières dépenses journalières</p>
          </div>
        ) : (
          Object.entries(groupedExpenses).map(([month, expenses]) => (
            <div key={month}>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={18} />
                {month}
              </h4>
              <div className="space-y-2">
                {expenses.map(expense => (
                  <div
                    key={expense.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{expense.description}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {getBudgetLineName(expense.budgetLineId)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(expense.expenseDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-red-600">
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
