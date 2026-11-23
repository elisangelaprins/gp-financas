'use client';

import { Wallet, BanknoteArrowDown, BanknoteArrowUp, Coins, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import type { StatCardsProps } from "@/lib/dashboard";

const cardHeaderStyle = "flex items-center justify-between";
const cardContainerStyle = "flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm";
const cardTitleStyle = 'text-sm font-medium text-gray-900';
const cardSubTitleStyle = "text-xs text-gray-400";
const cardValueStyle = 'mt-4 text-3xl font-bold tracking-tight text-gray-900';
const sizeLucide = "h-5 w-5"
const badgeBaseStyle = "mt-3 flex w-fit items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium";

const renderValue = (value: number, isLoading?: boolean) => {
  if (isLoading) return '...';
  return formatCurrency(value);
};

function calcularVariacao(atual: number, anterior?: number) {
  if (!anterior || anterior === 0) return 0;
  const diferenca = atual - anterior;
  return (diferenca / anterior) * 100;
};

function formatarPorcentagem(valor: number) {
  const numero = valor.toFixed(1);
  return valor >= 0 ? `+${numero}%` : `${numero}%`;
};

export function StatCards({ summary, trend = [], isLoading }: StatCardsProps) {
  const balance = summary?.balance ?? 0;
  const income = summary?.totalIncome ?? 0;
  const expense = summary?.totalExpense ?? 0;
  const currentMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
  const monthName = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  const mesAnterior = trend[trend.length - 2];
  const variacaoReceita = calcularVariacao(income, mesAnterior?.income);
  const variacaoDespesa = calcularVariacao(expense, mesAnterior?.expense);
  const variacaoSaldo = calcularVariacao(balance, mesAnterior?.balance);
  const mediaAtual = summary?.dailyExpenseAverage || (expense / 30);
  const mediaAnterior = mesAnterior?.expense ? (mesAnterior.expense / 30) : 0;
  const variacaoMedia = calcularVariacao(mediaAtual, mediaAnterior);

  return (
    <div className="grid gap-4 lg:grid-cols-4">

      {/* Card 1  */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-md flex flex-col justify-between min-h-[190px]">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex h-full flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Saldo total</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Wallet className={sizeLucide} />
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-white">{renderValue(balance, isLoading)}</p>
          <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-medium text-white">
            <TrendingUp className="h-3.5 w-3.5" />
            {variacaoSaldo >= 0 ? `+${variacaoSaldo.toFixed(1)}%` : `${variacaoSaldo.toFixed(1)}%`}
            <span className="font-normal text-white/70">vs. mês anterior</span>
          </div>
        </div>
      </div>

      { /* Card 2 */}
      <div className={cardContainerStyle}>
        <div className={cardHeaderStyle}>
          <div>
            <p className={cardTitleStyle}>Entradas</p>
            <p className={cardSubTitleStyle}>{monthName}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <BanknoteArrowDown className={sizeLucide} />
          </span>
        </div>
        <p className={cardValueStyle}>{renderValue(income, isLoading)}</p>
        <div className={`${badgeBaseStyle} bg-emerald-50 text-emerald-700`}>
          <TrendingUp className="h-3.5 w-3.5" />
          {variacaoReceita >= 0 ? `+${variacaoReceita.toFixed(1)}%` : `${variacaoReceita.toFixed(1)}%`}
        </div>
      </div>

      {/* Card 3 */}
      <div className={cardContainerStyle}>
        <div className={cardHeaderStyle}>
          <div>
            <p className={cardTitleStyle}>Gastos</p>
            <p className={cardSubTitleStyle}>{monthName}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <BanknoteArrowUp className={sizeLucide} />
          </span>
        </div>
        <p className={cardValueStyle}>{renderValue(expense, isLoading)}</p>
        <div className={`${badgeBaseStyle} bg-rose-50 text-rose-600`}>
          <TrendingDown className="h-3.5 w-3.5" />
          {variacaoDespesa >= 0 ? `+${variacaoDespesa.toFixed(1)}%` : `${variacaoDespesa.toFixed(1)}%`}
        </div>
      </div>

      {/* Card 4 */}
      <div className={cardContainerStyle}>
        <div className={cardHeaderStyle}>
          <div><p className={cardTitleStyle}>Média diária</p>
            <p className={cardSubTitleStyle}>{monthName}</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Coins className={sizeLucide} />
          </span>
        </div>
        <p className={cardValueStyle}>{renderValue(summary?.dailyExpenseAverage ?? 0, isLoading)}</p>
        <div className={`${badgeBaseStyle} bg-emerald-50 text-emerald-700 `}>
          <TrendingDown className="h-3.5 w-3.5" />
          -4,1%
        </div>
      </div>
    </div>
  )
}