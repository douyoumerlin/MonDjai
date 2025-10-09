import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Edit3, Save, Calendar, CreditCard } from 'lucide-react';
import { Loan, FutureExpense, CustomCategory } from '../types';
import { formatCurrency } from '../utils/calculations';

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
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [newLoan, setNewLoan] = useState({
    description: '',
    amount: '',
    paid: false
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    category: categories[0]?.name || '',
    amount: '',
    targetDate: new Date().toISOString().split('T')[0]
  });

  const [editLoanValues, setEditLoanValues] = useState<any>({});
  const [editExpenseValues, setEditExpenseValues] = useState<any>({});

  const handleAddLoan = () => {
    if (!newLoan.description || !newLoan.amount) return;

    onAddLoan({
      description: newLoan.description,
      amount: parseFloat(newLoan.amount),
      paid: false
    });

    setNewLoan({ description: '', amount: '', paid: false });
    setShowLoanForm(false);
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;

    onAddFutureExpense({
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      targetDate: newExpense.targetDate
    });

    setNewExpense({
      description: '',
      category: categories[0]?.name || '',
      amount: '',
      targetDate: new Date().toISOString().split('T')[0]
    });
    setShowExpenseForm(false);
  };

  const startEditLoan = (loan: Loan) => {
    setEditingLoanId(loan.id);
    setEditLoanValues({
      description: loan.description,
      amount: loan.amount.toString()
    });
  };

  const saveEditLoan = (id: string) => {
    onUpdateLoan(id, {
      description: editLoanValues.description,
      amount: parseFloat(editLoanValues.amount)
    });
    setEditingLoanId(null);
  };

  const startEditExpense = (expense: FutureExpense) => {
    setEditingExpenseId(expense.id);
    setEditExpenseValues({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
      targetDate: expense.targetDate
    });
  };

  const saveEditExpense = (id: string) => {
    onUpdateFutureExpense(id, {
      description: editExpenseValues.description,
      category: editExpenseValues.category,
      amount: parseFloat(editExpenseValues.amount),
      targetDate: editExpenseValues.targetDate
    });
    setEditingExpenseId(null);
  };

  const totalLoans = loans.filter(l => !l.paid).reduce((sum, l) => sum + l.amount, 0);
  const totalFutureExpenses = futureExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Prêts</h2>
              <p className="text-sm text-gray-600">Total non remboursé: {formatCurrency(totalLoans)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLoanForm(!showLoanForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>

        {showLoanForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Description du prêt"
                value={newLoan.description}
                onChange={(e) => setNewLoan({ ...newLoan, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Montant"
                value={newLoan.amount}
                onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddLoan}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowLoanForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loans.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucun prêt enregistré</p>
          ) : (
            loans.map((loan) => (
              <div
                key={loan.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  loan.paid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200 hover:border-red-300'
                }`}
              >
                {editingLoanId === loan.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editLoanValues.description}
                      onChange={(e) => setEditLoanValues({ ...editLoanValues, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={editLoanValues.amount}
                      onChange={(e) => setEditLoanValues({ ...editLoanValues, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEditLoan(loan.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingLoanId(null)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => onToggleLoan(loan.id)}
                        className={`p-2 rounded-lg transition-all ${
                          loan.paid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-green-100'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <div className={loan.paid ? 'opacity-50 line-through' : ''}>
                        <p className="font-semibold text-gray-800">{loan.description}</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(loan.amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!loan.paid && (
                        <button
                          onClick={() => startEditLoan(loan)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteLoan(loan.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dépenses Planifiées</h2>
              <p className="text-sm text-gray-600">Total planifié: {formatCurrency(totalFutureExpenses)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter
          </button>
        </div>

        {showExpenseForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Montant"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="date"
                value={newExpense.targetDate}
                onChange={(e) => setNewExpense({ ...newExpense, targetDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddExpense}
                  className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Enregistrer
                </button>
                <button
                  onClick={() => setShowExpenseForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {futureExpenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune dépense planifiée</p>
          ) : (
            futureExpenses.map((expense) => {
              const category = categories.find(c => c.name === expense.category);
              return (
                <div
                  key={expense.id}
                  className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all"
                >
                  {editingExpenseId === expense.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editExpenseValues.description}
                        onChange={(e) => setEditExpenseValues({ ...editExpenseValues, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={editExpenseValues.category}
                        onChange={(e) => setEditExpenseValues({ ...editExpenseValues, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={editExpenseValues.amount}
                        onChange={(e) => setEditExpenseValues({ ...editExpenseValues, amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        value={editExpenseValues.targetDate}
                        onChange={(e) => setEditExpenseValues({ ...editExpenseValues, targetDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditExpense(expense.id)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingExpenseId(null)}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: category?.color + '20' }}
                        >
                          {category?.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{expense.description}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="font-medium text-purple-600">{formatCurrency(expense.amount)}</span>
                            <span>•</span>
                            <span>{new Date(expense.targetDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditExpense(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDeleteFutureExpense(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
