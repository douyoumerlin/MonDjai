import { Income, Expense, Loan, FutureExpense, ExpenseCategory, CategoryStats, CustomCategory } from '../types';

export const calculateTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((total, income) => total + income.amount, 0);
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculatePaidExpenses = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => expense.isPaid)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const calculateUnpaidExpenses = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => !expense.isPaid)
    .reduce((total, expense) => total + expense.amount, 0);
};

export const calculateTotalLoans = (loans: Loan[]): number => {
  return loans.reduce((total, loan) => total + loan.amount, 0);
};

export const calculatePaidLoans = (loans: Loan[]): number => {
  return loans
    .filter(loan => loan.isPaid)
    .reduce((total, loan) => total + loan.amount, 0);
};

export const calculateUnpaidLoans = (loans: Loan[]): number => {
  return loans
    .filter(loan => !loan.isPaid)
    .reduce((total, loan) => total + loan.amount, 0);
};

export const calculateTotalFutureExpenses = (futureExpenses: FutureExpense[]): number => {
  return futureExpenses.reduce((total, expense) => total + expense.amount, 0);
};

export const calculateRemainingBudget = (incomes: Income[], expenses: Expense[]): number => {
  const totalIncome = calculateTotalIncome(incomes);
  const paidExpenses = calculatePaidExpenses(expenses);
  return totalIncome - paidExpenses;
};

export const calculateProjectedBalance = (
  incomes: Income[], 
  expenses: Expense[], 
  loans: Loan[], 
  futureExpenses: FutureExpense[]
): number => {
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalLoans = calculateTotalLoans(loans);
  const totalFuture = calculateTotalFutureExpenses(futureExpenses);
  
  return totalIncome - totalExpenses - totalLoans - totalFuture;
};

export const getDefaultExpenses = (): Expense[] => [
  {
    id: '1',
    amount: 150000,
    description: 'Loyer',
    category: 'Logement',
    date: new Date().toISOString(),
    isPaid: false,
    isDefault: true
  },
  {
    id: '2',
    amount: 50000,
    description: 'Électricité',
    category: 'Logement',
    date: new Date().toISOString(),
    isPaid: false,
    isDefault: true
  },
  {
    id: '3',
    amount: 80000,
    description: 'Courses alimentaires',
    category: 'Alimentation',
    date: new Date().toISOString(),
    isPaid: false,
    isDefault: true
  },
  {
    id: '4',
    amount: 30000,
    description: 'Transport',
    category: 'Transport',
    date: new Date().toISOString(),
    isPaid: false,
    isDefault: true
  },
  {
    id: '5',
    amount: 25000,
    description: 'Téléphone',
    category: 'Divers',
    date: new Date().toISOString(),
    isPaid: false,
    isDefault: true
  }
];

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
  const paidExpenses = expenses.filter(expense => expense.isPaid);
  const totalPaidExpenses = calculatePaidExpenses(expenses);
  
  if (totalPaidExpenses === 0) return [];
  
  const usedCategories = [...new Set(paidExpenses.map(expense => expense.category))];
  
  return usedCategories.map(categoryName => {
    const categoryExpenses = paidExpenses.filter(expense => expense.category === categoryName);
    const amount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = (amount / totalPaidExpenses) * 100;
    
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