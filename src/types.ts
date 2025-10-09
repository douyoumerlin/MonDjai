export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string;
  isRecurrent?: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  isPaid: boolean;
  isRecurrent?: boolean;
}

export interface Loan {
  id: string;
  description: string;
  amount: number;
  date: string;
  isPaid: boolean;
  budgetLineId?: string;
}

export interface FutureExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  targetDate: string;
  budgetLineId?: string;
  isPaid?: boolean;
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BudgetLine {
  id: string;
  description: string;
  category: string;
  plannedAmount: number;
  createdAt: string;
}

export interface DailyExpense {
  id: string;
  budgetLineId: string;
  amount: number;
  description: string;
  expenseDate: string;
  createdAt: string;
}
