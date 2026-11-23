'use client';

import { PieChart as PieIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "@/utils/formatters";
import type { CategoryDistribution } from "@/lib/dashboard";

interface CategoryDonutProps {
  categories?: CategoryDistribution[];
  isLoading?: boolean;
};

const DEFAULT_COLORS = ["#1B7A4D", "#C9A227", "#B5533D", "#8B95E0", "#A2A9A3"];

export function CategoryDonut({ categories = [], isLoading }: CategoryDonutProps) {
  const totalExpense = categories.reduce(
    (totalAccumulator, currentCategory) => totalAccumulator + currentCategory.total,
    0,
  );

  const chartData = categories.map(function (category, index) {
    const percentage = totalExpense > 0 ? ((category.total / totalExpense) * 100).toFixed(1) : "0";

    return {
      name: category.categoryName,
      value: category.total,
      color: category.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      percentage: percentage,
    };
  });

    return (
    <div className="rounded-2xl border border-[#E4E7DF] bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#14181A]">
          <PieIcon className="h-4 w-4 text-[#6B7570]" /> Gastos por categoria
        </h2>
        <p className="text-xs text-[#6B7570]">Distribuição das despesas do período</p>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row">
        
        <div className="relative h-44 w-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value || 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
               
       <div className="flex flex-1 flex-col gap-3">
          {isLoading ? (
            <div className="space-y-3">
              <div className="h-5 w-full animate-pulse rounded-lg bg-[#F1F2ED]" />
              <div className="h-5 w-full animate-pulse rounded-lg bg-[#F1F2ED]" />
            </div>
          ) : chartData.length === 0 ? (
            <p className="text-xs text-[#6B7570]">Nenhuma despesa registrada no período.</p>
          ) : (
            chartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#14181A]">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
                <div className="text-right font-mono">
                  <span className="font-semibold text-[#14181A]">{item.percentage}%</span>
                  <span className="ml-2 text-[#6B7570]">{formatCurrency(item.value)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
