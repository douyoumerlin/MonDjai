import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, AlertCircle, Edit3, Save, X, Palette } from 'lucide-react';
import { BudgetLine, CustomCategory, DailyExpense, Income } from '../types';
import { formatCurrency } from '../utils/calculations';
import { supabase } from '../utils/supabase';

interface BudgetLinesListProps {
  categories: CustomCategory[];
  incomes: Income[];
  onBudgetLinesChange: () => void;
  onAddCategory: (category: Omit<CustomCategory, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<CustomCategory>) => void;
  onDeleteCategory: (id: string) => void;
}

const availableIcons = ['🏠', '🚗', '🍽️', '🎯', '📦', '💰', '🛒', '⚡', '🏥', '📚', '🎮', '✈️', '👕', '🎵', '🏋️', '🐕', '🎨', '🔧'];
const availableColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export const BudgetLinesList: React.FC<BudgetLinesListProps> = ({
  categories,
  incomes,
  onBudgetLinesChange,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [newBudgetLine, setNewBudgetLine] = useState({
    description: '',
    category: categories[0]?.name || '',
    plannedAmount: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '🏠', color: '#3B82F6' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: linesData, error: linesError } = await supabase
        .from('budget_lines')
        .select('*')
        .order('created_at', { ascending: false });

      if (linesError) throw linesError;

      const formattedLines: BudgetLine[] = (linesData || []).map((item: any) => ({
        id: item.id,
        description: item.description,
        category: item.category,
        plannedAmount: parseFloat(item.planned_amount),
        createdAt: item.created_at
      }));
      setBudgetLines(formattedLines);

      const { data: expensesData, error: expensesError } = await supabase
        .from('daily_expenses')
        .select('*');

      if (expensesError) throw expensesError;

      const formattedExpenses: DailyExpense[] = (expensesData || []).map((item: any) => ({
        id: item.id,
        budgetLineId: item.budget_line_id,
        amount: parseFloat(item.amount),
        description: item.description,
        expenseDate: item.expense_date,
        createdAt: item.created_at
      }));
      setDailyExpenses(formattedExpenses);
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

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const currentBudgetTotal = budgetLines.reduce((sum, line) => sum + line.plannedAmount, 0);
    const newTotal = currentBudgetTotal + parseFloat(newBudgetLine.plannedAmount);

    if (newTotal > totalIncome) {
      alert(`Le budget total (${formatCurrency(newTotal)}) ne peut pas dépasser les revenus totaux (${formatCurrency(totalIncome)}).`);
      return;
    }

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
    }
  };

  const handleUpdateBudgetLine = async (id: string, field: string, value: any) => {
    const line = budgetLines.find(l => l.id === id);
    if (!line) return;

    if (field === 'plannedAmount') {
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      const currentBudgetTotal = budgetLines
        .filter(l => l.id !== id)
        .reduce((sum, l) => sum + l.plannedAmount, 0);
      const newTotal = currentBudgetTotal + parseFloat(value);

      if (newTotal > totalIncome) {
        alert(`Le budget total (${formatCurrency(newTotal)}) ne peut pas dépasser les revenus totaux (${formatCurrency(totalIncome)}).`);
        return;
      }
    }

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
      alert('Impossible de supprimer cette ligne car elle contient des dépenses.');
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
    }
  };

  const startEdit = (line: BudgetLine) => {
    setEditingId(line.id);
    setEditValues({
      description: line.description,
      category: line.category,
      plannedAmount: line.plannedAmount.toString()
    });
  };

  const saveEdit = async (id: string) => {
    await handleUpdateBudgetLine(id, 'description', editValues.description);
    await handleUpdateBudgetLine(id, 'category', editValues.category);
    await handleUpdateBudgetLine(id, 'plannedAmount', parseFloat(editValues.plannedAmount));
    setEditingId(null);
  };

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    onAddCategory(newCategory);
    setNewCategory({ name: '', icon: '🏠', color: '#3B82F6' });
  };

  const handleDeleteCategory = (id: string) => {
    const hasLines = budgetLines.some(line => {
      const cat = categories.find(c => c.id === id);
      return cat && line.category === cat.name;
    });

    if (hasLines) {
      alert('Impossible de supprimer cette catégorie car elle est utilisée.');
      return;
    }

    onDeleteCategory(id);
  };

  const getCategoryIcon = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.icon || '📦';
  };

  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Receipt className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Lignes Budgétaires</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Palette size={18} />
              <span className="hidden sm:inline">Catégories</span>
            </button>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            )}
          </div>
        </div>

        {showCategoryManager && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold mb-3">Gestion des catégories</h3>
            <div className="grid gap-3 mb-4">
              <input
                type="text"
                placeholder="Nom de la catégorie"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                <select
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <select
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg"
                >
                  {availableColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span style={{ color: cat.color }}>{cat.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdding && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="grid gap-4 mb-4">
              <input
                type="text"
                placeholder="Description"
                value={newBudgetLine.description}
                onChange={(e) => setNewBudgetLine({ ...newBudgetLine, description: e.target.value })}
                className="px-4 py-3 border border-blue-300 rounded-xl"
              />
              <select
                value={newBudgetLine.category}
                onChange={(e) => setNewBudgetLine({ ...newBudgetLine, category: e.target.value })}
                className="px-4 py-3 border border-blue-300 rounded-xl"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Montant prévu"
                value={newBudgetLine.plannedAmount}
                onChange={(e) => setNewBudgetLine({ ...newBudgetLine, plannedAmount: e.target.value })}
                className="px-4 py-3 border border-blue-300 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddBudgetLine}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
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
          {budgetLines.map(line => {
            const spent = getSpentAmount(line.id);
            const percentage = getPercentage(line.id, line.plannedAmount);
            const remaining = line.plannedAmount - spent;
            const isOverBudget = percentage > 100;
            const isWarning = percentage >= 80 && percentage < 100;

            return (
              <div
                key={line.id}
                className={`p-4 rounded-xl border-2 ${
                  isOverBudget
                    ? 'bg-red-50 border-red-300'
                    : isWarning
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {editingId === line.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.description}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <select
                      value={editValues.category}
                      onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editValues.plannedAmount}
                      onChange={(e) => setEditValues({ ...editValues, plannedAmount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(line.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg"
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
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(line.category)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">{line.description}</h3>
                          <p className="text-sm text-gray-600">{line.category}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(line)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteBudgetLine(line.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        Dépensé: <span className="font-semibold">{formatCurrency(spent)}</span>
                      </span>
                      <span className="text-gray-600">
                        Prévu: <span className="font-semibold">{formatCurrency(line.plannedAmount)}</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isOverBudget
                            ? 'bg-red-500'
                            : isWarning
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold ${isOverBudget ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-600'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                      <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Restant: {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && ' (dépassement)'}
                      </span>
                    </div>
                    {isOverBudget && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>Budget dépassé!</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
