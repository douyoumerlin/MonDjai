import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, BarChart3, Settings, Database } from 'lucide-react';
import { Income, Expense, CustomCategory } from './types';
import { Dashboard } from './components/Dashboard';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseChart } from './components/ExpenseChart';
import { MonthlyReport } from './components/MonthlyReport';
import { CategoryManager } from './components/CategoryManager';
import { DatabaseManager } from './components/DatabaseManager';
import { getDefaultCategories } from './utils/calculations';
import { LocalDatabase } from './utils/storage';

const STORAGE_KEYS = {
  INCOMES: 'budget_incomes',
  EXPENSES: 'budget_expenses',
  CATEGORIES: 'budget_categories'
};

function App() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CustomCategory[]>(getDefaultCategories());
  const [activeTab, setActiveTab] = useState<'overview' | 'add' | 'chart' | 'report' | 'categories' | 'database'>('overview');

  // Charger les données depuis le localStorage
  const loadData = () => {
    setIncomes(LocalDatabase.loadData(STORAGE_KEYS.INCOMES, []));
    setExpenses(LocalDatabase.loadData(STORAGE_KEYS.EXPENSES, []));
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
    LocalDatabase.saveData(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  const addIncome = (incomeData: Omit<Income, 'id' | 'date'>) => {
    const newIncome: Income = {
      ...incomeData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setIncomes([...incomes, newIncome]);
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setExpenses([...expenses, newExpense]);
  };

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

    // Vérifier si la catégorie est utilisée dans des dépenses
    const isUsed = expenses.some(expense => expense.category === categoryToDelete.name);
    if (isUsed) {
      alert('Cette catégorie ne peut pas être supprimée car elle est utilisée dans des dépenses existantes.');
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleDataChange = () => {
    loadData();
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Wallet },
    { id: 'add', label: 'Ajouter', icon: Plus },
    { id: 'chart', label: 'Graphique', icon: BarChart3 },
    { id: 'report', label: 'Rapport', icon: Minus },
    { id: 'categories', label: 'Catégories', icon: Settings },
    { id: 'database', label: 'Base de Données', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Wallet className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Budget Manager</h1>
          </div>
          <p className="text-gray-600">Gérez facilement votre budget mensuel</p>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-0 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
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
            <Dashboard incomes={incomes} expenses={expenses} />
          )}

          {activeTab === 'add' && (
            <div className="space-y-6">
              <IncomeForm onAddIncome={addIncome} />
              <ExpenseForm categories={categories} onAddExpense={addExpense} />
            </div>
          )}

          {activeTab === 'chart' && (
            <ExpenseChart expenses={expenses} categories={categories} />
          )}

          {activeTab === 'report' && (
            <MonthlyReport incomes={incomes} expenses={expenses} categories={categories} />
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
          <p>Budget Manager - Gérez vos finances personnelles en toute simplicité</p>
        </footer>
      </div>
    </div>
  );
}

export default App;