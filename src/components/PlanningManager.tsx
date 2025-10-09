import React, { useState } from 'react';
import { Plus, Trash2, Check, X, Edit3, Save, CreditCard, CalendarDays, DollarSign } from 'lucide-react';
import { Loan, FutureExpense, CustomCategory, BudgetLine } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PlanningManagerProps {
  loans: Loan[];
  futureExpenses: FutureExpense[];
  categories: CustomCategory[];
  budgetLines: BudgetLine[];
  onAddLoan: (loan: Omit<Loan, 'id' | 'date'>) => void;
  onUpdateLoan: (id: string, updates: Partial<Loan>) => void;
  onDeleteLoan: (id: string) => void;
  onToggleLoan: (id: string) => void;
  onAddFutureExpense: (expense: Omit<FutureExpense, 'id'>) => void;
  onUpdateFutureExpense: (id: string, updates: Partial<FutureExpense>) => void;
  onDeleteFutureExpense: (id: string) => void;
  onPayPlannedItem: (id: string, type: 'loan' | 'expense', budgetLineId: string, amount: number) => void;
}

export const PlanningManager: React.FC<PlanningManagerProps> = ({
  loans,
  futureExpenses,
  categories,
  budgetLines,
  onAddLoan,
  onUpdateLoan,
  onDeleteLoan,
  onToggleLoan,
  onAddFutureExpense,
  onUpdateFutureExpense,
  onDeleteFutureExpense,
  onPayPlannedItem
}) => {
  const [activeTab, setActiveTab] = useState<'loans' | 'expenses'>('loans');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newLoan, setNewLoan] = useState({
    description: '',
    amount: '',
    budgetLineId: budgetLines[0]?.id || ''
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    category: categories[0]?.name || '',
    amount: '',
    targetDate: new Date().toISOString().split('T')[0],
    budgetLineId: budgetLines[0]?.id || ''
  });

  const [editValues, setEditValues] = useState<any>({});

  const handleAddLoan = () => {
    if (!newLoan.description || !newLoan.amount || !newLoan.budgetLineId) return;

    onAddLoan({
      description: newLoan.description,
      amount: parseFloat(newLoan.amount),
      isPaid: false,
      budgetLineId: newLoan.budgetLineId
    });

    setNewLoan({ description: '', amount: '', budgetLineId: budgetLines[0]?.id || '' });
    setShowForm(false);
  };

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.budgetLineId) return;

    onAddFutureExpense({
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      targetDate: newExpense.targetDate,
      budgetLineId: newExpense.budgetLineId,
      isPaid: false
    });

    setNewExpense({
      description: '',
      category: categories[0]?.name || '',
      amount: '',
      targetDate: new Date().toISOString().split('T')[0],
      budgetLineId: budgetLines[0]?.id || ''
    });
    setShowForm(false);
  };

  const startEdit = (item: Loan | FutureExpense) => {
    setEditingId(item.id);
    if (activeTab === 'loans') {
      const loan = item as Loan;
      setEditValues({
        description: loan.description,
        amount: loan.amount.toString(),
        budgetLineId: loan.budgetLineId || budgetLines[0]?.id || ''
      });
    } else {
      const expense = item as FutureExpense;
      setEditValues({
        description: expense.description,
        category: expense.category,
        amount: expense.amount.toString(),
        targetDate: expense.targetDate,
        budgetLineId: expense.budgetLineId || budgetLines[0]?.id || ''
      });
    }
  };

  const saveEdit = (id: string) => {
    if (activeTab === 'loans') {
      onUpdateLoan(id, {
        description: editValues.description,
        amount: parseFloat(editValues.amount),
        budgetLineId: editValues.budgetLineId
      });
    } else {
      onUpdateFutureExpense(id, {
        description: editValues.description,
        category: editValues.category,
        amount: parseFloat(editValues.amount),
        targetDate: editValues.targetDate,
        budgetLineId: editValues.budgetLineId
      });
    }
    setEditingId(null);
  };

  const handlePay = (item: Loan | FutureExpense) => {
    const budgetLineId = item.budgetLineId;
    if (!budgetLineId) {
      alert('Aucune ligne budgétaire associée');
      return;
    }
    onPayPlannedItem(item.id, activeTab === 'loans' ? 'loan' : 'expense', budgetLineId, item.amount);
  };

  const totalLoans = loans.filter(l => !l.isPaid).reduce((sum, l) => sum + l.amount, 0);
  const totalFutureExpenses = futureExpenses.filter(e => !e.isPaid).reduce((sum, e) => sum + e.amount, 0);

  const activeItems = activeTab === 'loans' ? loans : futureExpenses;
  const unpaidItems = activeItems.filter((item: any) => !item.isPaid);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl shadow-lg ${
            activeTab === 'loans'
              ? 'bg-gradient-to-br from-red-500 to-pink-500'
              : 'bg-gradient-to-br from-blue-500 to-indigo-500'
          }`}>
            {activeTab === 'loans' ? (
              <CreditCard className="w-6 h-6 text-white" />
            ) : (
              <CalendarDays className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Planification</h2>
            <p className="text-sm text-gray-600">
              {activeTab === 'loans'
                ? `Total prêts non remboursés: ${formatCurrency(totalLoans)}`
                : `Total dépenses planifiées: ${formatCurrency(totalFutureExpenses)}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all ${
            activeTab === 'loans'
              ? 'bg-gradient-to-r from-red-500 to-pink-500'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500'
          }`}
        >
          <Plus className="w-5 h-5" />
          Ajouter
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('loans');
            setShowForm(false);
            setEditingId(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'loans'
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          Prêts
        </button>
        <button
          onClick={() => {
            setActiveTab('expenses');
            setShowForm(false);
            setEditingId(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'expenses'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          Dépenses Planifiées
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Description"
              value={activeTab === 'loans' ? newLoan.description : newExpense.description}
              onChange={(e) =>
                activeTab === 'loans'
                  ? setNewLoan({ ...newLoan, description: e.target.value })
                  : setNewExpense({ ...newExpense, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {activeTab === 'expenses' && (
              <>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={newExpense.targetDate}
                  onChange={(e) => setNewExpense({ ...newExpense, targetDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </>
            )}

            <input
              type="number"
              placeholder="Montant"
              value={activeTab === 'loans' ? newLoan.amount : newExpense.amount}
              onChange={(e) =>
                activeTab === 'loans'
                  ? setNewLoan({ ...newLoan, amount: e.target.value })
                  : setNewExpense({ ...newExpense, amount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={activeTab === 'loans' ? newLoan.budgetLineId : newExpense.budgetLineId}
              onChange={(e) =>
                activeTab === 'loans'
                  ? setNewLoan({ ...newLoan, budgetLineId: e.target.value })
                  : setNewExpense({ ...newExpense, budgetLineId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une ligne budgétaire</option>
              {budgetLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.description} - {formatCurrency(line.plannedAmount)}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={activeTab === 'loans' ? handleAddLoan : handleAddExpense}
                className={`flex-1 text-white px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'loans'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Enregistrer
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {unpaidItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {activeTab === 'loans' ? 'Aucun prêt en attente' : 'Aucune dépense planifiée'}
          </p>
        ) : (
          unpaidItems.map((item: any) => {
            const budgetLine = budgetLines.find(bl => bl.id === item.budgetLineId);
            const category = activeTab === 'expenses' ? categories.find(c => c.name === item.category) : null;

            return (
              <div
                key={item.id}
                className="p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editValues.description}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    {activeTab === 'expenses' && (
                      <>
                        <select
                          value={editValues.category}
                          onChange={(e) => setEditValues({ ...editValues, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="date"
                          value={editValues.targetDate}
                          onChange={(e) => setEditValues({ ...editValues, targetDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </>
                    )}
                    <input
                      type="number"
                      value={editValues.amount}
                      onChange={(e) => setEditValues({ ...editValues, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={editValues.budgetLineId}
                      onChange={(e) => setEditValues({ ...editValues, budgetLineId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Sélectionner une ligne budgétaire</option>
                      {budgetLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.description} - {formatCurrency(line.plannedAmount)}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(item.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
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
                      {activeTab === 'expenses' && category && (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.description}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="font-bold text-lg text-red-600">{formatCurrency(item.amount)}</span>
                          {activeTab === 'expenses' && item.targetDate && (
                            <>
                              <span>•</span>
                              <span>{new Date(item.targetDate).toLocaleDateString('fr-FR')}</span>
                            </>
                          )}
                          {budgetLine && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{budgetLine.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePay(item)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="Marquer comme payé et impacter la ligne budgétaire"
                      >
                        <DollarSign className="w-5 h-5" />
                        Payer
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => activeTab === 'loans' ? onDeleteLoan(item.id) : onDeleteFutureExpense(item.id)}
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
  );
};
