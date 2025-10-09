import { Income, Expense, Loan, FutureExpense, CustomCategory } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount) + ' CFA';
};

export const calculateTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((sum, income) => sum + income.amount, 0);
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculatePaidExpenses = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateUnpaidExpenses = (expenses: Expense[]): number => {
  return expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateTotalLoans = (loans: Loan[]): number => {
  return loans.reduce((sum, loan) => sum + loan.amount, 0);
};

export const calculateRemainingBudgetWithLoans = (
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[]
): number => {
  const totalIncome = calculateTotalIncome(incomes);
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalLoans = calculateTotalLoans(loans);
  return totalIncome - totalExpenses + totalLoans;
};

export const calculateProjectedBalance = (
  incomes: Income[],
  expenses: Expense[],
  loans: Loan[],
  futureExpenses: FutureExpense[]
): number => {
  const remainingBudget = calculateRemainingBudgetWithLoans(incomes, expenses, loans);
  const totalFutureExpenses = futureExpenses.reduce((sum, fe) => sum + fe.amount, 0);
  return remainingBudget - totalFutureExpenses;
};

export const getDefaultCategories = (): CustomCategory[] => [
  { id: '1', name: 'Logement', icon: '🏠', color: '#3B82F6' },
  { id: '2', name: 'Alimentation', icon: '🍽️', color: '#10B981' },
  { id: '3', name: 'Transport', icon: '🚗', color: '#F59E0B' },
  { id: '4', name: 'Santé', icon: '🏥', color: '#EF4444' },
  { id: '5', name: 'Loisirs', icon: '🎮', color: '#8B5CF6' },
  { id: '6', name: 'Épargne', icon: '💰', color: '#10B981' },
  { id: '7', name: 'Divers', icon: '📦', color: '#6B7280' }
];

export const getDefaultExpenses = (): Expense[] => [
  {
    id: crypto.randomUUID(),
    description: 'Loyer',
    amount: 800,
    category: 'Logement',
    date: new Date().toISOString(),
    isPaid: false,
    isRecurrent: true
  },
  {
    id: crypto.randomUUID(),
    description: 'Électricité',
    amount: 80,
    category: 'Logement',
    date: new Date().toISOString(),
    isPaid: false,
    isRecurrent: true
  },
  {
    id: crypto.randomUUID(),
    description: 'Courses',
    amount: 300,
    category: 'Alimentation',
    date: new Date().toISOString(),
    isPaid: false,
    isRecurrent: true
  },
  {
    id: crypto.randomUUID(),
    description: 'Essence',
    amount: 120,
    category: 'Transport',
    date: new Date().toISOString(),
    isPaid: false,
    isRecurrent: true
  }
];
