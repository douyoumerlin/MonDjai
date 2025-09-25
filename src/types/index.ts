export interface Income {
  id: string;
  amount: number;
  description: string;
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  isPaid: boolean;
  isDefault: boolean;
}

export interface Loan {
  id: string;
  amount: number;
  description: string;
  date: string;
  isPaid: boolean;
}

export interface FutureExpense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  expectedDate: string;
}

export type ExpenseCategory = string;

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CategoryStats {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}