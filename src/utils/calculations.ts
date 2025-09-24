import { Income, Expense, ExpenseCategory, CategoryStats, CustomCategory } from '../types';

export const calculateTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((total, income) => total + income.amount, 0);
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateBalance = (incomes: Income[], expenses: Expense[]): number => {
  return calculateTotalIncome(incomes) - calculateTotalExpenses(expenses);
};

export const getDefaultCategories = (): CustomCategory[] => [
  { id: '1', name: 'Logement', icon: '🏠', color: '#3B82F6', isDefault: true },
  { id: '2', name: 'Transport', icon: '🚗', color: '#10B981', isDefault: true },
  { id: '3', name: 'Alimentation', icon: '🍽️', color: '#F59E0B', isDefault: true },
  { id: '4', name: 'Loisirs', icon: '🎯', color: '#EF4444', isDefault: true },
  { id: '5', name: 'Divers', icon: '📦', color: '#8B5CF6', isDefault: true }
];

export const getCategoryColor = (categoryName: string, categories: CustomCategory[]): string => {
  const category = categories.find(cat => cat.name === categoryName);
  return category?.color || '#6B7280';
};

export const calculateCategoryStats = (expenses: Expense[], categories: CustomCategory[]): CategoryStats[] => {
  const totalExpenses = calculateTotalExpenses(expenses);
  
  const usedCategories = [...new Set(expenses.map(expense => expense.category))];
  
  return usedCategories.map(categoryName => {
    const categoryExpenses = expenses.filter(expense => expense.category === categoryName);
    const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    
    return {
      category: categoryName,
      amount,
      percentage,
      color: getCategoryColor(categoryName, categories)
    };
  }).filter(stat => stat.amount > 0);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(date));
};