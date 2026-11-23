import { apiClient } from "@/lib/api";

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  dailyExpenseAverage: number;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  color?: string;
  total: number;
}

export interface BudgetGoal {
  id: string;
  amountLimit: number;
  spent: number;
  remaining: number;
  percentageSpent: number;
  category?: { name: string; color?: string };
}

export interface TopExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: { name: string; color?: string; icon?: string };
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface StatCardsProps {
  summary: DashboardSummary | null;
  trend?: MonthlyTrend[];
  isLoading?: boolean;
}

export interface BalanceBarChartProps {
  data?: MonthlyTrend[];
  isLoading?: boolean;
}

function buildPeriodQuery(month?: number, year?: number): string {
  const query = new URLSearchParams();
  if (month) query.append("month", String(month));
  if (year) query.append("year", String(year));
  const str = query.toString();
  return str ? `?${str}` : "";
}

export async function getBudgets(month?: number, year?: number) {
  return apiClient<BudgetGoal[]>(`/api/budgets${buildPeriodQuery(month, year)}`);
}

export async function getDashboardSummary(month?: number, year?: number) {
  return apiClient<DashboardSummary>(`/api/dashboard/summary${buildPeriodQuery(month, year)}`);
}

export async function getCategoryDistribution(month?: number, year?: number, transactionType: string = "EXPENSE") {
  return apiClient<CategoryDistribution[]>(`/api/dashboard/by-category${buildPeriodQuery(month, year)}&transactionType=${transactionType}`);
}

export async function getTopExpenses(month?: number, year?: number) {
  return apiClient<TopExpense[]>(`/api/dashboard/top-expenses${buildPeriodQuery(month, year)}`);
}

export async function getMonthlyTrend(months: number = 6) {
  return apiClient<MonthlyTrend[]>(`/api/dashboard/monthly-trend?months=${months}`);
}
