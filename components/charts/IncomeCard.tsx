"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";

function calcIncome(txs: AnyTransaction[]): number {
    return txs
        .filter((t) => t.status !== "CANCELLED")
        .reduce((acc, t) => {
            if (t.status !== "PROCESSED") return acc;
            // Entradas: deposit e transfer são positivos
            if (t.type === "deposit" || t.type === "transfer") {
                return acc + t.amount;
            }
            return acc;
        }, 0);
}

export default function IncomeCard() {
  const txs = useTxStore((s) => s.transactions);
  const income = calcIncome(txs);

  return (
    <Card className="p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Entradas
        </p>
        <p className="mt-2 text-[1.35rem] sm:text-[1.6rem] font-semibold leading-tight tracking-tight text-emerald-600 dark:text-emerald-300">
          {formatBRL(income)}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Total do mês</p>
      </div>
    </Card>
  );
}
