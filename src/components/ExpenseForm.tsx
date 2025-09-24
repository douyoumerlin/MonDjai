import React, { useState } from 'react';
import { Minus, Receipt } from 'lucide-react';
import { Expense, ExpenseCategory, CustomCategory } from '../types';

interface ExpenseFormProps {
  categories: CustomCategory[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ categories, onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(categories[0]?.name || 'Divers');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAddExpense({
      amount: parseFloat(amount),
      description: description.trim(),
      category
    });

    setAmount('');
    setDescription('');
    setCategory(categories[0]?.name || 'Divers');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Minus size={20} />
          Ajouter une Dépense
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="text-red-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Nouvelle Dépense</h3>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: Courses, Essence, Restaurant..."
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.name)}
                className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                  category === cat.name
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};