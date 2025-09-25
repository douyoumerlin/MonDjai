import React, { useState } from 'react';
import { Plus, DollarSign, Trash2, Edit3, Save, X, TrendingUp } from 'lucide-react';
import { Income } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

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
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAddIncome({
      amount: parseFloat(amount),
      description: description.trim()
    });

    setAmount('');
    setDescription('');
    setIsOpen(false);
  };

  const handleUpdateIncome = (id: string, field: string, value: any) => {
    onUpdateIncome(id, { [field]: value });
    if (field !== 'amount' && field !== 'description') {
      setEditingId(null);
    }
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return (
    <div className="space-y-6">
      {/* Résumé des revenus */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-emerald-600" size={20} />
              <span className="font-medium text-emerald-800">Total des Revenus</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {formatCurrency(totalIncome)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-emerald-600">{incomes.length} source(s)</div>
            <div className="text-xs text-emerald-500">de revenus</div>
          </div>
        </div>
      </div>

      {/* Bouton d'ajout */}
      <div className="mb-6">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus size={24} />
            Ajouter un Revenu
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-emerald-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Nouveau Revenu</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Ex: Salaire, Freelance, Bonus..."
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Liste des revenus */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="text-emerald-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Mes Revenus</h3>
        </div>

        <div className="space-y-3">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium shadow-sm">
                    <DollarSign size={18} />
                  </div>
                  
                  <div className="flex-1">
                    {editingId === income.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={income.description}
                          onChange={(e) => handleUpdateIncome(income.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={income.amount}
                          onChange={(e) => handleUpdateIncome(income.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-gray-800">{income.description}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(income.amount)} • {formatDate(income.date)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {editingId === income.id ? (
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                    >
                      <Save size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(income.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onDeleteIncome(income.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {incomes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">💰</div>
            <p className="text-gray-500">Aucun revenu enregistré</p>
            <p className="text-sm text-gray-400 mt-1">Commencez par ajouter vos sources de revenus</p>
          </div>
        )}
      </div>
    </div>
  );
};