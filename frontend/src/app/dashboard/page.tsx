'use client';

import { useEffect, useState } from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { BalanceBarChart } from '@/components/dashboard/BalanceBarChart';
import { getDashboardSummary, getMonthlyTrend } from '@/lib/dashboard';
import type { DashboardSummary, MonthlyTrend } from '@/lib/dashboard';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>({
    balance: 24850,
    totalIncome: 9200,
    totalExpense: 5670,
    dailyExpenseAverage: 189,
  });
  const [trend, setTrend] = useState<MonthlyTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resumo, tendencia] = await Promise.all([getDashboardSummary(), getMonthlyTrend()]);
        if (resumo) setSummary(resumo);
        if (tendencia) setTrend(tendencia);

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setIsLoading(false);
      }
    }
    carregarDados();
  }, []);

  return (
    <div className='space-y-6 p-6'>
      <StatCards summary={summary} trend={trend} isLoading={isLoading} />
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='lg:col-span-8'>
          <BalanceBarChart data={trend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}