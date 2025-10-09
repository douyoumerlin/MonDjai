import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { BudgetLine, CustomCategory, DailyExpense } from '../types';
import { formatCurrency } from '../utils/calculations';
import { supabase } from '../utils/supabase';

interface BudgetLinesListProps {
  categories: CustomCategory[];
  onBudgetLinesChange: () => void;
}

export const BudgetLinesList: React.FC<BudgetLinesListProps> = ({
  categories,
  onBudgetLinesChange
}) => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBudgetLine, setNewBudgetLine] = useState({
    description: '',
    category: categories[0]?.name || '',
    plannedAmount: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetLinesResult, expensesResult] = await Promise.all([
        supabase.from('budget_lines').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_expenses').select('*')
      ]);

      if (budgetLinesResult.error) throw budgetLinesResult.error;
      if (expensesResult.error) throw expensesResult.error;

      const formattedBudgetLines: BudgetLine[] = (budgetLinesResult.data || []).map((item: any) => ({
        id: item.id,
        description: item.description,
        category: item.category,
        plannedAmount: parseFloat(item.planned_amount),
        createdAt: item.created_at
      }));

      const formattedExpenses: DailyExpense[] = (expensesResult.data || []).map((item: any) => ({
        id: item.id,
        budgetLineId: item.budget_line_id,
        amount: parseFloat(item.amount),
        description: item.description,
        expenseDate: item.expense_date,
        createdAt: item.created_at
      }));

      setBudgetLines(formattedBudgetLines);
      setDailyExpenses(formattedExpenses);
      onBudgetLinesChange();
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpentAmount = (budgetLineId: string): number => {
    return dailyExpenses
      .filter(e => e.budgetLineId === budgetLineId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getPercentage = (budgetLineId: string, plannedAmount: number): number => {
    const spent = getSpentAmount(budgetLineId);
    return plannedAmount > 0 ? (spent / plannedAmount) * 100 : 0;
  };

  const handleAddBudgetLine = async () => {
    if (!newBudgetLine.description || !newBudgetLine.plannedAmount) return;

    try {
      const { data, error } = await supabase
        .from('budget_lines')
        .insert([{
          description: newBudgetLine.description,
          category: newBudgetLine.category,
          planned_amount: parseFloat(newBudgetLine.plannedAmount)
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedLine: BudgetLine = {
        id: data.id,
        description: data.description,
        category: data.category,
        plannedAmount: parseFloat(data.planned_amount),
        createdAt: data.created_at
      };

      setBudgetLines([formattedLine, ...budgetLines]);
      setNewBudgetLine({
        description: '',
        category: categories[0]?.name || '',
        plannedAmount: ''
      });
      setIsAdding(false);
      onBudgetLinesChange();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout de la ligne budgétaire');
    }
  };

  const handleUpdateBudgetLine = async (id: string, field: string, value: any) => {
    const line = budgetLines.find(l => l.id === id);
    if (!line) return;

    const updatedData: any = {};
    if (field === 'description') updatedData.description = value;
    if (field === 'category') updatedData.category = value;
    if (field === 'plannedAmount') updatedData.planned_amount = value;

    try {
      const { error } = await supabase
        .from('budget_lines')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setBudgetLines(budgetLines.map(l =>
        l.id === id ? { ...l, [field]: field === 'plannedAmount' ? parseFloat(value) : value } : l
      ));
      onBudgetLinesChange();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteBudgetLine = async (id: string) => {
    const hasExpenses = dailyExpenses.some(e => e.budgetLineId === id);

    if (hasExpenses) {
      alert('Impossible de supprimer cette ligne budgétaire car elle contient des dépenses.');
      return;
    }

    if (!confirm('Supprimer cette ligne budgétaire ?')) return;

    try {
      const { error } = await supabase
        .from('budget_lines')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBudgetLines(budgetLines.filter(l => l.id !== id));
      onBudgetLinesChange();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#6B7280';
  };

  const getGaugeColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

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
          <Receipt className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Lignes Budgétaires</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {isAdding && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouvelle Ligne Budgétaire</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newBudgetLine.description}
                onChange={(e) => setNewBudgetLine({ ...newBudgetLine, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Loyer, Électricité..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={newBudgetLine.category}
                  onChange={(e) => setNewBudgetLine({ ...newBudgetLine, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Montant Prévu (FCFA)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBudgetLine.plannedAmount}
                  onChange={(e) => setNewBudgetLine({ ...newBudgetLine, plannedAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddBudgetLine}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Save size={16} />
              Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <X size={16} />
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {budgetLines.map((line) => {
          const spent = getSpentAmount(line.id);
          const percentage = getPercentage(line.id, line.plannedAmount);
          const isNearLimit = percentage >= 80 && percentage < 100;
          const isOverLimit = percentage >= 100;

          return (
            <div
              key={line.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isOverLimit
                  ? 'bg-red-50 border-red-300 shadow-sm'
                  : isNearLimit
                  ? 'bg-orange-50 border-orange-300 shadow-sm'
                  : 'bg-gray-50 border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(line.category) }}
                >
                  {getCategoryIcon(line.category)}
                </div>

                <div className="flex-1 min-w-0">
                  {editingId === line.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleUpdateBudgetLine(line.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.plannedAmount}
                        onChange={(e) => handleUpdateBudgetLine(line.id, 'plannedAmount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-800">{line.description}</div>
                      <div className="text-sm text-gray-500">
                        {line.category} • Budget: {formatCurrency(line.plannedAmount)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {editingId === line.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(line.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteBudgetLine(line.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Dépensé: {formatCurrency(spent)} / {formatCurrency(line.plannedAmount)}
                  </span>
                  <span className={`font-medium ${
                    isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getGaugeColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {isNearLimit && !isOverLimit && (
                  <div className="flex items-center gap-2 text-xs text-orange-700 bg-orange-100 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>Attention: Budget presque atteint ({percentage.toFixed(1)}%)</span>
                  </div>
                )}

                {isOverLimit && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>Budget dépassé! Nouvelles dépenses bloquées</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {budgetLines.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-gray-500">Aucune ligne budgétaire</p>
          <p className="text-sm text-gray-400 mt-1">Créez vos premières lignes budgétaires</p>
        </div>
      )}
    </div>
  );
};
