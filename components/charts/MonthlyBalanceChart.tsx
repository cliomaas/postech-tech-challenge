"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";
import { useMemo } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

type MonthlyData = {
  month: string;
  monthKey: string; // "2025-01" para ordenação
  balance: number;
};

function calculateMonthlyBalance(txs: AnyTransaction[]): MonthlyData[] {
  const monthlyMap = new Map<string, { income: number; expense: number }>();

  txs
    .filter((t) => t.status !== "CANCELLED" && t.status === "PROCESSED")
    .forEach((t) => {
      const date = parseISO(t.date);
      const monthKey = format(startOfMonth(date), "yyyy-MM");

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const data = monthlyMap.get(monthKey)!;

      // Entradas
      if (t.type === "deposit" || t.type === "transfer") {
        data.income += t.amount;
      }
      // Saídas
      if (t.type === "withdraw" || t.type === "payment" || t.type === "pix") {
        data.expense += t.amount;
      }
    });

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .map(([monthKey, data]) => {
      const date = parseISO(`${monthKey}-01`);
      return {
        month: format(date, "MMM", { locale: ptBR }),
        monthKey,
        balance: data.income - data.expense,
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  return monthlyData;
}

export default function MonthlyBalanceChart() {
  const txs = useTxStore((s) => s.transactions);
  const monthlyData = useMemo(() => calculateMonthlyBalance(txs), [txs]);

  if (monthlyData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Saldo Mensal
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhuma transação processada encontrada
        </p>
      </Card>
    );
  }

  // Calcular range para o gráfico
  const allValues = monthlyData.map((d) => d.balance);
  const maxBalance = Math.max(...allValues, 0);
  const minBalance = Math.min(...allValues, 0);
  const maxValue = Math.max(Math.abs(maxBalance), Math.abs(minBalance), 1000);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Saldo Mensal
      </h3>

      <div className="flex items-end justify-between gap-3 h-64">
        {/* Eixo Y - Valores */}
        <div className="flex flex-col justify-between h-full pb-8 pr-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatBRL(maxValue)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {formatBRL(maxValue / 2)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            R$ 0,00
          </span>
          {minBalance < 0 && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatBRL(-maxValue / 2)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatBRL(-maxValue)}
              </span>
            </>
          )}
        </div>

        {/* Gráfico de Barras */}
        <div className="flex-1 flex items-end justify-between gap-2 h-full relative">
          {/* Linha de zero na base */}
          <div className="absolute left-0 right-0 bottom-8 h-px bg-gray-300 dark:bg-gray-600 z-0" />

          {monthlyData.map((data) => {
            // Altura da barra: porcentagem do espaço disponível (altura total - espaço dos labels)
            const availableHeight = 100; // 100% do container menos o espaço dos labels (calculado como 2rem = ~8%)
            const barHeightPercent = maxValue > 0 ? (Math.abs(data.balance) / maxValue) * availableHeight : 0;
            const isPositive = data.balance >= 0;

            return (
              <div
                key={data.monthKey}
                className="flex-1 flex flex-col items-center relative"
                style={{ height: "100%" }}
              >
                {/* Container da área do gráfico (altura disponível) */}
                <div className="flex-1 w-full relative" style={{ paddingBottom: "2rem" }}>
                  {/* Valor acima da barra */}
                  {data.balance !== 0 && (
                    <div
                      className={`absolute w-full px-1 py-0.5 rounded text-xs font-medium text-center ${isPositive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      style={{
                        bottom: `${barHeightPercent}%`,
                        marginBottom: "4px",
                      }}
                    >
                      {formatBRL(data.balance)}
                    </div>
                  )}

                  {/* Barra - sempre começa do zero (bottom: 0 dentro deste container) */}
                  {data.balance !== 0 && (
                    <div
                      className={`absolute w-full transition-all ${isPositive
                          ? "bg-green-500 dark:bg-green-600 rounded-t"
                          : "bg-red-500 dark:bg-red-600 rounded-b"
                        }`}
                      style={{
                        bottom: 0,
                        height: `${barHeightPercent}%`,
                        minHeight: "4px",
                      }}
                    />
                  )}

                  {/* Barra zero (linha fina) */}
                  {data.balance === 0 && (
                    <div className="absolute bottom-0 w-full h-px bg-gray-400 dark:bg-gray-500" />
                  )}
                </div>

                {/* Label do mês */}
                <span className="text-xs text-gray-600 dark:text-gray-400 capitalize pt-1 w-full text-center">
                  {data.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
