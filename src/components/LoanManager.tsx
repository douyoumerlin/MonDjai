import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Loan } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface LoanManagerProps {
  loans: Loan[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'date'>) => void;
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
}

export const LoanManager: React.FC<LoanManagerProps> = ({
  loans,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onToggleLoan
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLoan, setNewLoan] = useState({
    amount: '',
    description: '',
    isPaid: false
  });

  const handleAddLoan = () => {
    if (!newLoan.amount || !newLoan.description) return;
    
    onAddLoan({
      amount: parseFloat(newLoan.amount),
      description: newLoan.description.trim(),
      isPaid: newLoan.isPaid
    });
    
    setNewLoan({ amount: '', description: '', isPaid: false });
    setIsAdding(false);
  };

  const handleUpdateLoan = (id: string, field: string, value: any) => {
    onUpdateLoan(id, { [field]: value });
    if (field !== 'amount' && field !== 'description') {
      setEditingId(null);
    }
  };

  const paidLoans = loans.filter(loan => loan.isPaid);
  const unpaidLoans = loans.filter(loan => !loan.isPaid);
  const totalPaid = paidLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalUnpaid = unpaidLoans.reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CreditCard className="text-purple-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Prêts en Cours</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={16} />
          Nouveau Prêt
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-red-600" size={18} />
            <span className="font-medium text-red-800">À Rembourser</span>
          </div>
          <div className="text-xl font-bold text-red-700">{formatCurrency(totalUnpaid)}</div>
          <div className="text-sm text-red-600">{unpaidLoans.length} prêt(s)</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={18} />
            <span className="font-medium text-green-800">Remboursés</span>
          </div>
          <div className="text-xl font-bold text-green-700">{formatCurrency(totalPaid)}</div>
          <div className="text-sm text-green-600">{paidLoans.length} prêt(s)</div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-gray-600" size={18} />
            <span className="font-medium text-gray-800">Total</span>
          </div>
          <div className="text-xl font-bold text-gray-700">{formatCurrency(totalPaid + totalUnpaid)}</div>
          <div className="text-sm text-gray-600">{loans.length} prêt(s)</div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="font-medium text-gray-800 mb-3">Nouveau Prêt</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={newLoan.description}
                onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Prêt personnel, Crédit auto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant à rembourser (FCFA)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newLoan.amount}
                onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newLoan.isPaid}
                onChange={(e) => setNewLoan({ ...newLoan, isPaid: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Déjà remboursé</span>
            </label>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddLoan}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
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

      {/* Liste des prêts */}
      <div className="space-y-3">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              loan.isPaid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  loan.isPaid ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {loan.isPaid ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                
                <div className="flex-1">
                  {editingId === loan.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={loan.description}
                        onChange={(e) => handleUpdateLoan(loan.id, 'description', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={loan.amount}
                        onChange={(e) => handleUpdateLoan(loan.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-gray-800">{loan.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(loan.amount)} • {formatDate(loan.date)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle Payé/Non payé */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loan.isPaid}
                    onChange={() => onToggleLoan(loan.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {loan.isPaid ? 'Remboursé' : 'En cours'}
                  </span>
                </label>
                
                {/* Actions */}
                {editingId === loan.id ? (
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-green-600 hover:text-green-800 transition-colors duration-200"
                  >
                    <Save size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => setEditingId(loan.id)}
                    className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => onDeleteLoan(loan.id)}
                  className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loans.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">💳</div>
          <p className="text-gray-500">Aucun prêt enregistré</p>
        </div>
      )}
    </div>
  );
};