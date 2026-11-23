import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: "balance" | "income" | "expense" | "neutral";
  isLoading?: boolean;
}

const variantStyles = {
  balance: "bg-[#EAF6F0] text-[#0F5A3A] border-[#A8E6CF]",
  income: "bg-[#EAF6F0] text-[#1B7A4D] border-[#C3E8D5]",
  expense: "bg-[#FDF2F2] text-[#E53E3E] border-[#FDE8E8]",
  neutral: "bg-[#F4F6F4] text-[#1B7A4D] border-[#E2E5DF]",
};

export function SummaryCard({ title, value, icon: Icon, variant = "neutral", isLoading } : SummaryCardProps) {
  const badgeStyle = variantStyles[variant];

  return (
    <div className="rounded-2xl border border-[#E2E5DF] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7570]">
          {title}
        </span>
        <div className={`rounded-xl p-2.5 border ${badgeStyle}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        {isLoading ? (
          <div className="h-8 w-28 animate-pulse rounded-lg bg-[#F1F2ED]" />
        ) : (
          <h3 className="text-2xl font-bold text-[#14181A]">
            {formatCurrency(value)}
          </h3>
        )}
      </div>
    </div>
  );
}