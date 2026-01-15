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
        <Card className="p-6">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Saídas</p>
                <p className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-300">
                    {formatBRL(expense)}
                </p>
            </div>
        </Card>
    );
}
