"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";
import { useMemo } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Saldo Mensal
      </h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatBRL}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              formatter={(value) => formatBRL(Number(value))}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <ReferenceLine y={0} stroke="rgba(148, 163, 184, 0.4)" strokeWidth={1} />
            <Bar dataKey="balance" radius={[6, 6, 6, 6]}>
              {monthlyData.map((entry) => (
                <Cell
                  key={entry.monthKey}
                  fill={entry.balance >= 0 ? "#16a34a" : "#dc2626"}
                />
              ))}
              <LabelList
                dataKey="balance"
                content={({ value, x, y, width, height }) => {
                  const numeric = Number(value ?? 0);
                  if (!width || !height) return null;
                  const labelX = Number(x) + Number(width) / 2;
                  const labelY =
                    numeric >= 0 ? Number(y) - 6 : Number(y) + Number(height) + 14;
                  return (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      fill={numeric >= 0 ? "#86efac" : "#fecaca"}
                      fontSize={12}
                      fontWeight={600}
                    >
                      {formatBRL(numeric)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
