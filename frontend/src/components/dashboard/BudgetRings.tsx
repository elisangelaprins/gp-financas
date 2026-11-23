'use client';

import { Target } from "lucide-react";
import type { BudgetGoal } from "@/lib/dashboard";

interface BudgetRingsProps {
  budgets?: BudgetGoal[];
  isLoading?: boolean;
}

function getBudgetStatus(percentage: number) {
  if (percentage >= 100) {
    return { label: "Estourado", color: "#B5533D", statusClass: "text-[#B5533D]" };
  }
  if (percentage >= 85) {
    return { label: "Quase no limite", color: "#C9A227", statusClass: "text-[#C9A227]" };
  }
  return { label: "Dentro do limite", color: "#1B7A4D", statusClass: "text-[#1B7A4D]" };
}

export function BudgetRings({ budgets = [], isLoading }: BudgetRingsProps) {
  return (
    <div className="rounded-2xl border border-[#E4E7DF] bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#14181A]">
          <Target className="h-4 w-4 text-[#6B7570]" /> Orçamentos do mês
        </h2>
        <p className="text-xs text-[#6B7570]">% do limite utilizado por categoria</p>
      </div>
      <div className="flex flex-wrap items-center justify-around gap-6">
        {isLoading ? (
          <div className="flex gap-6">
            <div className="h-24 w-24 animate-pulse rounded-full bg-[#F1F2ED]" />
            <div className="h-24 w-24 animate-pulse rounded-full bg-[#F1F2ED]" />
          </div>
        ) : budgets.length === 0 ? (
          <p className="text-xs text-[#6B7570]">Nenhum orçamento configurado para este mês.</p>
        ) : (
          budgets.map((b) => {
            const status = getBudgetStatus(b.percentageSpent);
            const strokeDash = Math.min((b.percentageSpent / 100) * 226, 226);

            return (
              <div key={b.id} className="flex flex-col items-center gap-2 text-center">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="h-full w-full" viewBox="0 0 86 86">
                    <circle cx="43" cy="43" r="36" fill="none" stroke="#EEF0EA" strokeWidth="9" />
                    <circle
                      cx="43"
                      cy="43"
                      r="36"
                      fill="none"
                      stroke={status.color}
                      strokeWidth="9"
                      strokeDasharray={`${strokeDash} 226`}
                      strokeLinecap="round"
                      transform="rotate(-90 43 43)"
                    />
                    <text x="43" y="48" textAnchor="middle" className="font-mono text-[14px] font-bold fill-[#14181A]">
                      {Math.round(b.percentageSpent)}%
                    </text>
                  </svg>
                </div>
                <div className="text-xs font-semibold text-[#14181A]">{b.category?.name || "Geral"}</div>
                <div className={`text-[11px] font-medium ${status.statusClass}`}>{status.label}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
