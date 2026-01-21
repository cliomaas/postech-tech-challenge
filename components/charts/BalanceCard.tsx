"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { calcBalance } from "@/lib/utils/currency";
import { clsx } from "clsx";
import { formatBRL } from "@/src/core/money";

export default function BalanceCard() {
  const txs = useTxStore((s) => s.transactions);
  const balance = calcBalance(txs);

  return (
    <Card className="relative overflow-hidden p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/70 via-emerald-400/40 to-transparent" />
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Saldo
        </p>
        <p
          className={clsx(
            "mt-2 text-4xl font-semibold tracking-tight",
            balance >= 0
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-rose-600 dark:text-rose-300"
          )}
        >
          {formatBRL(balance)}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Disponível neste mês
        </p>
      </div>
    </Card>
  );
}
