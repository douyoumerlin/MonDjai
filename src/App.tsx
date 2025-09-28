import React, { useState, useEffect } from 'react';
import { Wallet, Plus, BarChart3, Database, Calendar, Minus } from 'lucide-react';
import { Income, Expense, Loan, FutureExpense, CustomCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseList } from './components/ExpenseList';
import { PlanningManager } from './components/PlanningManager';
import { ExpenseChart } from './components/ExpenseChart';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'planning' | 'chart' | 'database'>('overview');

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

  const updateIncome = (id: string, updates: Partial<Income>) => {
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, ...updates } : income
    ));
  };

  const deleteIncome = (id: string) => {
    if (confirm('Supprimer ce revenu ?')) {
      setIncomes(incomes.filter(income => income.id !== id));
    }
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
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleDataChange = () => {
    loadData();
  };

  const tabs = [
    { id: 'overview', label: 'Accueil', icon: Wallet },
    { id: 'income', label: 'Revenus', icon: Plus },
    { id: 'expenses', label: 'Dépenses', icon: Minus },
    { id: 'planning', label: 'Planification', icon: Calendar },
    { id: 'chart', label: 'Analyses', icon: BarChart3 },
    { id: 'database', label: 'Données', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Wallet className="text-white" size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Budget Manager
            </h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Gérez votre budget avec simplicité et efficacité</p>
        </header>

        {/* Navigation */}
        <nav className="mb-6 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-1 border border-gray-200/50">
            <div className="flex overflow-x-auto gap-1 pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-shrink-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:scale-102'
                    }`}
                  >
                    <Icon size={18} />
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
            <IncomeForm 
              incomes={incomes}
              onAddIncome={addIncome} 
              onUpdateIncome={updateIncome}
              onDeleteIncome={deleteIncome}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              categories={categories}
              onToggleExpense={toggleExpense}
              onAddExpense={addExpense}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
              onAddCategory={addCategory}
            />
          )}

          {activeTab === 'planning' && (
            <PlanningManager
              loans={loans}
              futureExpenses={futureExpenses}
              categories={categories}
              onAddLoan={addLoan}
              onUpdateLoan={updateLoan}
              onDeleteLoan={deleteLoan}
              onToggleLoan={toggleLoan}
              onAddFutureExpense={addFutureExpense}
              onUpdateFutureExpense={updateFutureExpense}
              onDeleteFutureExpense={deleteFutureExpense}
            />
          )}

          {activeTab === 'chart' && (
            <ExpenseChart expenses={expenses} categories={categories} incomes={incomes} loans={loans} />
          )}

          {activeTab === 'database' && (
            <DatabaseManager onDataChange={handleDataChange} />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-gray-400 text-xs sm:text-sm">
          <p>Budget Manager - Votre assistant financier personnel</p>
        </footer>
      </div>
    </div>
  );
}

export default App;