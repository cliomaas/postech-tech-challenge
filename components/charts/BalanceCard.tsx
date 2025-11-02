"use client";
import Card from "@/components/ds/Card";
import Badge from "@/components/ds/Badge";
import { useTxStore } from "@/lib/store";
import { calcBalance, currencyBRL } from "@/lib/utils/currency";

export default function BalanceCard() {
  const txs = useTxStore(s => s.transactions);
  const balance = calcBalance(txs);
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">Saldo</p>
          <p className="mt-1 text-3xl font-semibold">{currencyBRL(balance)}</p>
        </div>
        <Badge color={balance >= 0 ? "green" : "red"}>{balance >= 0 ? "Positivo" : "Negativo"}</Badge>
      </div>
    </Card>
  );
}
