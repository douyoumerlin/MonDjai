import React, { useState, useEffect } from 'react';
import { Wallet, Plus, BarChart3, FileText, Settings, Database, CreditCard, Calendar } from 'lucide-react';
import { Income, Expense, Loan, FutureExpense, CustomCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseList } from './components/ExpenseList';
import { LoanManager } from './components/LoanManager';
import { FutureExpenses } from './components/FutureExpenses';
import { ExpenseChart } from './components/ExpenseChart';
import { MonthlyReport } from './components/MonthlyReport';
import { CategoryManager } from './components/CategoryManager';
import { DatabaseManager } from './components/DatabaseManager';
import { getDefaultCategories, getDefaultExpenses } from './utils/calculations';
import { LocalDatabase } from './utils/storage';

const STORAGE_KEYS = {
  INCOMES: 'budget_incomes',
  EXPENSES: 'budget_expenses',
  LOANS: 'budget_loans',
  FUTURE_EXPENSES: 'budget_future_expenses',
  CATEGORIES: 'budget_categories'
};

function App() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [futureExpenses, setFutureExpenses] = useState<FutureExpense[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>(getDefaultCategories());
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'loans' | 'future' | 'chart' | 'report' | 'categories' | 'database'>('overview');

  // Charger les données depuis le localStorage
  const loadData = () => {
    setIncomes(LocalDatabase.loadData(STORAGE_KEYS.INCOMES, []));
    
    // Charger les dépenses ou utiliser les dépenses par défaut
    const savedExpenses = LocalDatabase.loadData(STORAGE_KEYS.EXPENSES, []);
    if (savedExpenses.length === 0) {
      setExpenses(getDefaultExpenses());
    } else {
      setExpenses(savedExpenses);
    }
    
    setLoans(LocalDatabase.loadData(STORAGE_KEYS.LOANS, []));
    setFutureExpenses(LocalDatabase.loadData(STORAGE_KEYS.FUTURE_EXPENSES, []));
    setCategories(LocalDatabase.loadData(STORAGE_KEYS.CATEGORIES, getDefaultCategories()));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sauvegarder dans le localStorage
  useEffect(() => {
    LocalDatabase.saveData(STORAGE_KEYS.INCOMES, incomes);
  }, [incomes]);

  useEffect(() => {
    LocalDatabase.saveData(STORAGE_KEYS.EXPENSES, expenses);
  }, [expenses]);

  useEffect(() => {
    LocalDatabase.saveData(STORAGE_KEYS.LOANS, loans);
  }, [loans]);

  useEffect(() => {
    LocalDatabase.saveData(STORAGE_KEYS.FUTURE_EXPENSES, futureExpenses);
  }, [futureExpenses]);

  useEffect(() => {
    LocalDatabase.saveData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  // Gestion des revenus
  const addIncome = (incomeData: Omit<Income, 'id' | 'date'>) => {
    const newIncome: Income = {
      ...incomeData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setIncomes([...incomes, newIncome]);
  };

  // Gestion des dépenses
  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  };

  const deleteExpense = (id: string) => {
    if (confirm('Supprimer cette dépense ?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const toggleExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, isPaid: !expense.isPaid } : expense
    ));
  };

  // Gestion des prêts
  const addLoan = (loanData: Omit<Loan, 'id' | 'date'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setLoans([...loans, newLoan]);
  };

  const updateLoan = (id: string, updates: Partial<Loan>) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, ...updates } : loan
    ));
  };

  const deleteLoan = (id: string) => {
    if (confirm('Supprimer ce prêt ?')) {
      setLoans(loans.filter(loan => loan.id !== id));
    }
  };

  const toggleLoan = (id: string) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, isPaid: !loan.isPaid } : loan
    ));
  };

  // Gestion des dépenses futures
  const addFutureExpense = (expenseData: Omit<FutureExpense, 'id'>) => {
    const newFutureExpense: FutureExpense = {
      ...expenseData,
      id: crypto.randomUUID()
    };
    setFutureExpenses([...futureExpenses, newFutureExpense]);
  };

  const updateFutureExpense = (id: string, updates: Partial<FutureExpense>) => {
    setFutureExpenses(futureExpenses.map(expense => 
      expense.id === id ? { ...expense, ...updates } : expense
    ));
  };

  const deleteFutureExpense = (id: string) => {
    if (confirm('Supprimer cette dépense future ?')) {
      setFutureExpenses(futureExpenses.filter(expense => expense.id !== id));
    }
  };

  // Gestion des catégories
  const addCategory = (categoryData: Omit<CustomCategory, 'id'>) => {
    const newCategory: CustomCategory = {
      ...categoryData,
      id: crypto.randomUUID()
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<CustomCategory>) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    if (!categoryToDelete) return;

    // Vérifier si la catégorie est utilisée
    const isUsedInExpenses = expenses.some(expense => expense.category === categoryToDelete.name);
    const isUsedInFuture = futureExpenses.some(expense => expense.category === categoryToDelete.name);
    
    if (isUsedInExpenses || isUsedInFuture) {
      alert('Cette catégorie ne peut pas être supprimée car elle est utilisée dans des dépenses existantes.');
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleDataChange = () => {
    loadData();
  };

  const tabs = [
    { id: 'overview', label: 'Tableau de Bord', icon: Wallet },
    { id: 'income', label: 'Revenus', icon: Plus },
    { id: 'expenses', label: 'Dépenses', icon: FileText },
    { id: 'loans', label: 'Prêts', icon: CreditCard },
    { id: 'future', label: 'À Prévoir', icon: Calendar },
    { id: 'chart', label: 'Graphique', icon: BarChart3 },
    { id: 'report', label: 'Rapport', icon: FileText },
    { id: 'categories', label: 'Catégories', icon: Settings },
    { id: 'database', label: 'Données', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wallet className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Budget Manager Pro</h1>
          </div>
          <p className="text-gray-600">Gérez votre budget avec un système de suivi complet</p>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <Dashboard 
              incomes={incomes} 
              expenses={expenses} 
              loans={loans}
              futureExpenses={futureExpenses}
            />
          )}

          {activeTab === 'income' && (
            <IncomeForm onAddIncome={addIncome} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              categories={categories}
              onToggleExpense={toggleExpense}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          )}

          {activeTab === 'loans' && (
            <LoanManager
              loans={loans}
              onAddLoan={addLoan}
              onUpdateLoan={updateLoan}
              onDeleteLoan={deleteLoan}
              onToggleLoan={toggleLoan}
            />
          )}

          {activeTab === 'future' && (
            <FutureExpenses
              futureExpenses={futureExpenses}
              categories={categories}
              onAddFutureExpense={addFutureExpense}
              onUpdateFutureExpense={updateFutureExpense}
              onDeleteFutureExpense={deleteFutureExpense}
            />
          )}

          {activeTab === 'chart' && (
            <ExpenseChart expenses={expenses} categories={categories} />
          )}

          {activeTab === 'report' && (
            <MonthlyReport 
              incomes={incomes} 
              expenses={expenses} 
              loans={loans}
              futureExpenses={futureExpenses}
              categories={categories} 
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager 
              categories={categories}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseManager onDataChange={handleDataChange} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>Budget Manager Pro - Système complet de gestion budgétaire</p>
        </footer>
      </div>
    </div>
  );
}

export default App;