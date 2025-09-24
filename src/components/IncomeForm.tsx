import React, { useState } from 'react';
import { Plus, DollarSign } from 'lucide-react';
import { Income } from '../types';

interface IncomeFormProps {
  onAddIncome: (income: Omit<Income, 'id' | 'date'>) => void;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ onAddIncome }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Ajouter un Revenu
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="text-emerald-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Nouveau Revenu</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: Salaire, Freelance, Bonus..."
            required
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
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