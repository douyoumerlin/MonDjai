import React, { useState } from 'react';
import { Plus, Trash2, CreditCard as Edit3, Save, X, Receipt } from 'lucide-react';
import { Expense, CustomCategory } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ExpenseListProps {
  expenses: Expense[];
  categories: CustomCategory[];
  onToggleExpense: (id: string) => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCategory: (category: Omit<CustomCategory, 'id'>) => void;
}

const availableIcons = ['🏠', '🚗', '🍽️', '🎯', '📦', '💰', '🛒', '⚡', '🏥', '📚', '🎮', '✈️', '👕', '🎵', '🏋️', '🐕', '🎨', '🔧'];
const availableColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onToggleExpense,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddCategory
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: categories[0]?.name || 'Divers',
    isPaid: false,
    isDefault: false
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '📦',
    color: '#6B7280'
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) return;
    
    onAddExpense({
      amount: parseFloat(newExpense.amount),
      description: newExpense.description.trim(),
      category: newExpense.category,
      isPaid: newExpense.isPaid,
      isDefault: false
    });
    
    setNewExpense({
      amount: '',
      description: '',
      category: categories[0]?.name || 'Divers',
      isPaid: false,
      isDefault: false
    });
    setIsAdding(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    
    onAddCategory({
      ...newCategory,
      name: newCategory.name.trim(),
      isDefault: false
    });
    
    setNewCategory({ name: '', icon: '📦', color: '#6B7280' });
    setIsAddingCategory(false);
  };

  const handleUpdateExpense = (id: string, field: string, value: any) => {
    onUpdateExpense(id, { [field]: value });
    if (field !== 'amount' && field !== 'description') {
      setEditingId(null);
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Receipt className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Dépenses Mensuelles</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Catégorie
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout de catégorie */}
      {isAddingCategory && (
        <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
          <h4 className="font-medium text-purple-800 mb-3">Nouvelle Catégorie</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Nom</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Santé, Éducation..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Icône</label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, icon })}
                    className={`p-2 rounded-lg border transition-all duration-200 ${
                      newCategory.icon === icon
                        ? 'bg-purple-100 border-purple-500'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-2">Couleur</label>
              <div className="grid grid-cols-5 gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategory({ ...newCategory, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      newCategory.color === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddCategory}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Save size={16} />
              Ajouter
            </button>
            <button
              onClick={() => setIsAddingCategory(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <X size={16} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouvelle Dépense</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="Ex: Courses, Essence..."
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="0.00"
              />
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newExpense.isPaid}
                  onChange={(e) => setNewExpense({ ...newExpense, isPaid: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Déjà payé</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddExpense}
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

      {/* Liste des dépenses */}
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              expense.isPaid 
                ? 'bg-green-50 border-green-200 shadow-sm' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                  style={{ backgroundColor: getCategoryColor(expense.category) }}
                >
                  {getCategoryIcon(expense.category)}
                </div>
                
                <div className="flex-1">
                  {editingId === expense.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={expense.description}
                        onChange={(e) => handleUpdateExpense(expense.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={expense.amount}
                        onChange={(e) => handleUpdateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-800">{expense.description}</div>
                      <div className="text-sm text-gray-500">
                        {expense.category} • {formatCurrency(expense.amount)}
                        {expense.isDefault && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Par défaut
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                {/* Toggle Payé/Non payé */}
                <label className="relative inline-flex items-center cursor-pointer mb-2 sm:mb-0">
                  <input
                    type="checkbox"
                    checked={expense.isPaid}
                    onChange={() => onToggleExpense(expense.id)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                    {expense.isPaid ? 'Payé' : 'Non payé'}
                  </span>
                </label>
                
                {/* Actions */}
                <div className="flex gap-1">
                  {editingId === expense.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(expense.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">📋</div>
          <p className="text-gray-500">Aucune dépense enregistrée</p>
          <p className="text-sm text-gray-400 mt-1">Commencez par ajouter vos premières dépenses</p>
        </div>
      )}
    </div>
  );
};