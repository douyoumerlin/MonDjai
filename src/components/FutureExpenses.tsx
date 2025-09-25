import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, Calendar, Clock } from 'lucide-react';
import { FutureExpense, CustomCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface FutureExpensesProps {
  futureExpenses: FutureExpense[];
  categories: CustomCategory[];
  onAddFutureExpense: (expense: Omit<FutureExpense, 'id'>) => void;
  onUpdateFutureExpense: (id: string, updates: Partial<FutureExpense>) => void;
  onDeleteFutureExpense: (id: string) => void;
}

export const FutureExpenses: React.FC<FutureExpensesProps> = ({
  futureExpenses,
  categories,
  onAddFutureExpense,
  onUpdateFutureExpense,
  onDeleteFutureExpense
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: categories[0]?.name || 'Divers',
    expectedDate: ''
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.expectedDate) return;
    
    onAddFutureExpense({
      amount: parseFloat(newExpense.amount),
      description: newExpense.description.trim(),
      category: newExpense.category,
      expectedDate: newExpense.expectedDate
    });
    
    setNewExpense({
      amount: '',
      description: '',
      category: categories[0]?.name || 'Divers',
      expectedDate: ''
    });
    setIsAdding(false);
  };

  const handleUpdateExpense = (id: string, field: string, value: any) => {
    onUpdateFutureExpense(id, { [field]: value });
    if (field !== 'amount' && field !== 'description' && field !== 'expectedDate') {
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

  const totalAmount = futureExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Trier par date prévue
  const sortedExpenses = [...futureExpenses].sort((a, b) => 
    new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-orange-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Dépenses à Prévoir</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Nouvelle Dépense
        </button>
      </div>

      {/* Résumé */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-orange-800">Total des Dépenses Prévues</div>
            <div className="text-2xl font-bold text-orange-700">{formatCurrency(totalAmount)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-600">{futureExpenses.length} dépense(s)</div>
            <div className="text-xs text-orange-500">À budgétiser</div>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouvelle Dépense Future</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Vacances, Réparation voiture..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant estimé (FCFA)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date prévue</label>
              <input
                type="date"
                value={newExpense.expectedDate}
                onChange={(e) => setNewExpense({ ...newExpense, expectedDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddExpense}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Save size={16} />
              Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <X size={16} />
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des dépenses futures */}
      <div className="space-y-3">
        {sortedExpenses.map((expense) => {
          const isOverdue = new Date(expense.expectedDate) < new Date();
          
          return (
            <div
              key={expense.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isOverdue 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                    style={{ backgroundColor: getCategoryColor(expense.category) }}
                  >
                    {getCategoryIcon(expense.category)}
                  </div>
                  
                  <div className="flex-1">
                    {editingId === expense.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={expense.description}
                          onChange={(e) => handleUpdateExpense(expense.id, 'description', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={expense.amount}
                          onChange={(e) => handleUpdateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="date"
                          value={expense.expectedDate}
                          onChange={(e) => handleUpdateExpense(expense.id, 'expectedDate', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          {expense.description}
                          {isOverdue && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                              <Clock size={12} />
                              En retard
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.category} • {formatCurrency(expense.amount)} • {formatDate(expense.expectedDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Actions */}
                  {editingId === expense.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-green-600 hover:text-green-800 transition-colors duration-200"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(expense.id)}
                      className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteFutureExpense(expense.id)}
                    className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {futureExpenses.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📅</div>
          <p className="text-gray-500">Aucune dépense future planifiée</p>
        </div>
      )}
    </div>
  );
};