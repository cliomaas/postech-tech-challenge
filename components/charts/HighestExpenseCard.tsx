"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";

function findHighestExpense(txs: AnyTransaction[]): { amount: number; description: string } | null {
    const expenses = txs
        .filter((t) => t.status !== "CANCELLED" && t.status === "PROCESSED")
        .filter((t) => t.type === "withdraw" || t.type === "payment" || t.type === "pix");

    if (expenses.length === 0) return null;

    const highest = expenses.reduce((max, t) => {
        return t.amount > max.amount ? { amount: t.amount, description: t.description || "Sem descrição" } : max;
    }, { amount: 0, description: "" });

    return highest.amount > 0 ? highest : null;
}

export default function HighestExpenseCard() {
    const txs = useTxStore((s) => s.transactions);
    const highestExpense = findHighestExpense(txs);

    return (
        <Card className="p-6">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maior Gasto</p>
                {highestExpense ? (
                    <>
                        <p className="mt-1 text-3xl font-semibold text-red-600 dark:text-red-300">
                            {formatBRL(highestExpense.amount)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                            {highestExpense.description}
                        </p>
                    </>
                ) : (
                    <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">
                        Nenhum gasto encontrado
                    </p>
                )}
            </div>
        </Card>
    );
}
