'use client';

import Link from "next/link";
import { Receipt, ArrowRight, ArrowUpFromLine } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { TopExpense } from "@/lib/dashboard";

interface RecentTransactionsProps {
  expenses?: TopExpense[];
  isLoading?: boolean;
};

export function RecentTransactions({ expenses = [], isLoading }: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-[#E4E7DF] bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#14181A]">
            <Receipt className="h-4 w-4 text-[#6B7570]" /> Maiores despesas do mês
          </h2>
          <p className="text-xs text-[#6B7570]">Lançamentos de maior valor no período</p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-[#1B7A4D] hover:underline"
        >
          Ver todas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-[#E4E7DF]">
        {isLoading ? (
          <div className="space-y-3 py-2">
            <div className="h-10 w-full animate-pulse rounded-xl bg-[#F1F2ED]" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-[#F1F2ED]" />
          </div>
        ) : expenses.length === 0 ? (
          <p className="py-4 text-xs text-[#6B7570]">Nenhuma despesa encontrada no período.</p>
        ) : (
          expenses.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7EAE6] text-[#B5533D]">
                  <ArrowUpFromLine className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#14181A]">{tx.description}</div>
                  <div className="text-[11px] text-[#6B7570]">
                    {tx.category?.name || "Sem Categoria"} · {new Date(tx.date).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#B5533D]">− {formatCurrency(tx.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
