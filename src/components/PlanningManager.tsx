import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, Calendar, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { Loan, FutureExpense, CustomCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/calculations';

interface PlanningManagerProps {
  loans: Loan[];
  futureExpenses: FutureExpense[];
  categories: CustomCategory[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'date'>) => void;
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
  onAddFutureExpense: (expense: Omit<FutureExpense, 'id'>) => void;
  onUpdateFutureExpense: (id: string, updates: Partial<FutureExpense>) => void;
  onDeleteFutureExpense: (id: string) => void;
}

export const PlanningManager: React.FC<PlanningManagerProps> = ({
  loans,
  futureExpenses,
  categories,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onToggleLoan,
  onAddFutureExpense,
  onUpdateFutureExpense,
  onDeleteFutureExpense
}) => {
  const [activeSection, setActiveSection] = useState<'loans' | 'future'>('loans');
  const [isAddingLoan, setIsAddingLoan] = useState(false);
  const [isAddingFuture, setIsAddingFuture] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [editingFutureId, setEditingFutureId] = useState<string | null>(null);
  
  const [newLoan, setNewLoan] = useState({
    amount: '',
    description: '',
    isPaid: false
  });

  const [newFutureExpense, setNewFutureExpense] = useState({
    amount: '',
    description: '',
    category: categories[0]?.name || 'Divers',
    expectedDate: ''
  });

  const handleAddLoan = () => {
    if (!newLoan.amount || !newLoan.description) return;
    
    onAddLoan({
      amount: parseFloat(newLoan.amount),
      description: newLoan.description.trim(),
      isPaid: newLoan.isPaid
    });
    
    setNewLoan({ amount: '', description: '', isPaid: false });
    setIsAddingLoan(false);
  };

  const handleAddFutureExpense = () => {
    if (!newFutureExpense.amount || !newFutureExpense.description || !newFutureExpense.expectedDate) return;
    
    onAddFutureExpense({
      amount: parseFloat(newFutureExpense.amount),
      description: newFutureExpense.description.trim(),
      category: newFutureExpense.category,
      expectedDate: newFutureExpense.expectedDate
    });
    
    setNewFutureExpense({
      amount: '',
      description: '',
      category: categories[0]?.name || 'Divers',
      expectedDate: ''
    });
    setIsAddingFuture(false);
  };

  const handleUpdateLoan = (id: string, field: string, value: any) => {
    onUpdateLoan(id, { [field]: value });
    if (field !== 'amount' && field !== 'description') {
      setEditingLoanId(null);
    }
  };

  const handleUpdateFutureExpense = (id: string, field: string, value: any) => {
    onUpdateFutureExpense(id, { [field]: value });
    if (field !== 'amount' && field !== 'description' && field !== 'expectedDate') {
      setEditingFutureId(null);
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

  const paidLoans = loans.filter(loan => loan.isPaid);
  const unpaidLoans = loans.filter(loan => !loan.isPaid);
  const totalPaidLoans = paidLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalUnpaidLoans = unpaidLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalFutureExpenses = futureExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const sortedFutureExpenses = [...futureExpenses].sort((a, b) => 
    new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-purple-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">Planification</h3>
      </div>

      {/* Navigation des sections */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveSection('loans')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeSection === 'loans'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <CreditCard size={18} />
          Prêts en Cours
        </button>
        <button
          onClick={() => setActiveSection('future')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            activeSection === 'future'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Calendar size={18} />
          À Prévoir
        </button>
      </div>

      {/* Section Prêts */}
      {activeSection === 'loans' && (
        <div>
          {/* Statistiques des prêts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-red-600" size={18} />
                <span className="font-medium text-red-800">À Rembourser</span>
              </div>
              <div className="text-xl font-bold text-red-700">{formatCurrency(totalUnpaidLoans)}</div>
              <div className="text-sm text-red-600">{unpaidLoans.length} prêt(s)</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={18} />
                <span className="font-medium text-green-800">Remboursés</span>
              </div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(totalPaidLoans)}</div>
              <div className="text-sm text-green-600">{paidLoans.length} prêt(s)</div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="text-gray-600" size={18} />
                <span className="font-medium text-gray-800">Total</span>
              </div>
              <div className="text-xl font-bold text-gray-700">{formatCurrency(totalPaidLoans + totalUnpaidLoans)}</div>
              <div className="text-sm text-gray-600">{loans.length} prêt(s)</div>
            </div>
          </div>

          {/* Bouton d'ajout */}
          <div className="mb-4">
            <button
              onClick={() => setIsAddingLoan(true)}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              Nouveau Prêt
            </button>
          </div>

          {/* Formulaire d'ajout de prêt */}
          {isAddingLoan && (
            <div className="bg-purple-50 rounded-xl p-4 mb-4 border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-3">Nouveau Prêt</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={newLoan.description}
                    onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
                    className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    placeholder="Ex: Prêt personnel, Crédit auto..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700 mb-2">Montant à rembourser (FCFA)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                    className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newLoan.isPaid}
                      onChange={(e) => setNewLoan({ ...newLoan, isPaid: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-purple-700">Déjà remboursé</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddLoan}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Save size={16} />
                  Ajouter
                </button>
                <button
                  onClick={() => setIsAddingLoan(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
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
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  loan.isPaid 
                    ? 'bg-green-50 border-green-200 shadow-sm' 
                    : 'bg-red-50 border-red-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${
                      loan.isPaid ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {loan.isPaid ? <CheckCircle size={18} /> : <Clock size={18} />}
                    </div>
                    
                    <div className="flex-1">
                      {editingLoanId === loan.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={loan.description}
                            onChange={(e) => handleUpdateLoan(loan.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={loan.amount}
                            onChange={(e) => handleUpdateLoan(loan.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                    {/* Toggle Payé/Non payé */}
                    <label className="relative inline-flex items-center cursor-pointer mb-2 sm:mb-0">
                      <input
                        type="checkbox"
                        checked={loan.isPaid}
                        onChange={() => onToggleLoan(loan.id)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                        {loan.isPaid ? 'Remboursé' : 'En cours'}
                      </span>
                    </label>
                    
                    {/* Actions */}
                    <div className="flex gap-1">
                      {editingLoanId === loan.id ? (
                        <button
                          onClick={() => setEditingLoanId(null)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        >
                          <Save size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingLoanId(loan.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDeleteLoan(loan.id)}
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

          {loans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">💳</div>
              <p className="text-gray-500">Aucun prêt enregistré</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez vos prêts en cours pour un meilleur suivi</p>
            </div>
          )}
        </div>
      )}

      {/* Section Dépenses Futures */}
      {activeSection === 'future' && (
        <div>
          {/* Résumé des dépenses futures */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-orange-800">Total des Dépenses Prévues</div>
                <div className="text-2xl font-bold text-orange-700">{formatCurrency(totalFutureExpenses)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-orange-600">{futureExpenses.length} dépense(s)</div>
                <div className="text-xs text-orange-500">À budgétiser</div>
              </div>
            </div>
          </div>

          {/* Bouton d'ajout */}
          <div className="mb-4">
            <button
              onClick={() => setIsAddingFuture(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              Nouvelle Dépense Future
            </button>
          </div>

          {/* Formulaire d'ajout de dépense future */}
          {isAddingFuture && (
            <div className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-3">Nouvelle Dépense Future</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={newFutureExpense.description}
                    onChange={(e) => setNewFutureExpense({ ...newFutureExpense, description: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                    placeholder="Ex: Vacances, Réparation voiture..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">Montant estimé (FCFA)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newFutureExpense.amount}
                      onChange={(e) => setNewFutureExpense({ ...newFutureExpense, amount: e.target.value })}
                      className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-2">Date prévue</label>
                    <input
                      type="date"
                      value={newFutureExpense.expectedDate}
                      onChange={(e) => setNewFutureExpense({ ...newFutureExpense, expectedDate: e.target.value })}
                      className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-orange-700 mb-2">Catégorie</label>
                  <select
                    value={newFutureExpense.category}
                    onChange={(e) => setNewFutureExpense({ ...newFutureExpense, category: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddFutureExpense}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <Save size={16} />
                  Ajouter
                </button>
                <button
                  onClick={() => setIsAddingFuture(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                >
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des dépenses futures */}
          <div className="space-y-3">
            {sortedFutureExpenses.map((expense) => {
              const isOverdue = new Date(expense.expectedDate) < new Date();
              
              return (
                <div
                  key={expense.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    isOverdue 
                      ? 'bg-red-50 border-red-200 shadow-sm' 
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
                        {editingFutureId === expense.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={expense.description}
                              onChange={(e) => handleUpdateFutureExpense(expense.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={expense.amount}
                                onChange={(e) => handleUpdateFutureExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="date"
                                value={expense.expectedDate}
                                onChange={(e) => handleUpdateFutureExpense(expense.id, 'expectedDate', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
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
                    
                    <div className="flex gap-1">
                      {editingFutureId === expense.id ? (
                        <button
                          onClick={() => setEditingFutureId(null)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        >
                          <Save size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingFutureId(expense.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDeleteFutureExpense(expense.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
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
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">📅</div>
              <p className="text-gray-500">Aucune dépense future planifiée</p>
              <p className="text-sm text-gray-400 mt-1">Planifiez vos futures dépenses pour mieux budgétiser</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};