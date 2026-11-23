'use client';

import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { BalanceBarChartProps } from '@/lib/dashboard';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export function BalanceBarChart({ data = [], isLoading }: BalanceBarChartProps) {
  if (isLoading) {
    return <div className="h-[360px] animate-pulse rounded-2xl bg-gray-100" />;
  }
  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Evolução do saldo
          </h3>
          <p className='text-xs text-gray-500'>
            Últimos meses
          </p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="balance" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}