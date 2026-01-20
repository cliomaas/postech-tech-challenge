"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";

function calcExpense(txs: AnyTransaction[]): number {
    return txs
        .filter((t) => t.status !== "CANCELLED")
        .reduce((acc, t) => {
            if (t.status !== "PROCESSED") return acc;
            // Saídas: withdraw, payment e pix são negativos
            if (t.type === "withdraw" || t.type === "payment" || t.type === "pix") {
                return acc + t.amount;
            }
            return acc;
        }, 0);
}

export default function ExpenseCard() {
  const txs = useTxStore((s) => s.transactions);
  const expense = calcExpense(txs);

  return (
    <Card className="p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Saídas
        </p>
        <p className="mt-2 text-[1.35rem] sm:text-[1.6rem] font-semibold leading-tight tracking-tight text-rose-600 dark:text-rose-300">
          {formatBRL(expense)}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Total do mês</p>
      </div>
    </Card>
  );
}
