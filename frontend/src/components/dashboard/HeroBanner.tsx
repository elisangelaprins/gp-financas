'use client';

import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { DashboardSummary, MonthlyTrend } from "@/lib/dashboard";

interface HeroBannerProps {
  summary: DashboardSummary | null;
  trend?: MonthlyTrend[];
  month?: number;
  year?: number;
  isLoading?: boolean;
};

function getFormattedMonthName(month?: number, year?: number): string {
  const d = new Date(
    year ?? new Date().getFullYear(),
    month ? month - 1 : new Date().getMonth(),
  );

  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

function formatParts(val: number) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);

  const [integerPart, centsPart] = formatted.split(",");
  return { integerPart, centsPart };
};

export function HeroBanner({ summary, trend = [], month, year, isLoading } : HeroBannerProps) {
  const monthName = getFormattedMonthName(month, year);
  const balanceParts = formatParts(summary?.balance ?? 0);
  const incomeParts = formatParts(summary?.totalIncome ?? 0);
  const expenseParts = formatParts(summary?.totalExpense ?? 0);
  const chartData = trend;

  return (
    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#38B37D] via-[#1B7A4D] to-[#0F5A3A] p-8 pb-0 text-white shadow-xl">
      {/* Topo: Saldo Consolidado */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/75">
            <Calendar className="h-3.5 w-3.5" /> Saldo consolidado · {monthName}
          </div>
          <div className="mono mt-2 flex items-baseline gap-1 text-4xl font-bold tracking-tight md:text-5xl">
            {isLoading ? (
              <div className="h-12 w-48 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <>
                <span>R$ {balanceParts.integerPart}</span>
                <span className="text-2xl font-semibold text-white/70">
                  ,{balanceParts.centsPart}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6 flex flex-wrap gap-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <TrendingUp className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-[11px] text-white/70">Receitas</div>
            <div className="mono text-sm font-bold">
              R$ {incomeParts.integerPart},{incomeParts.centsPart}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <TrendingDown className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <div className="text-[11px] text-white/70">Despesas</div>
            <div className="mono text-sm font-bold">
              R$ {expenseParts.integerPart},{expenseParts.centsPart}
            </div>
          </div>
        </div>
      </div>
      {/* Gráfico Ondulado Dinâmico Recharts */}
      <div className="relative z-0 -mx-8 mt-5 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#ffffff"
              strokeWidth={2.5}
              fill="url(#heroGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rótulos dos Meses */}
      <div className="relative z-10 flex justify-between border-t border-white/10 py-3 font-mono text-[10.5px] text-white/60">
        {chartData.map((d, i) => (
          <span
            key={i}
            className={i === chartData.length - 1 ? "font-bold text-white" : ""}
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
};
