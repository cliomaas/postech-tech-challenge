"use client";
import Card from "@/components/ds/Card";
import { useTxStore } from "@/lib/store";
import { formatBRL } from "@/src/core/money";
import type { AnyTransaction } from "@/lib/types";
import { useMemo } from "react";

type CategoryData = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

const CATEGORY_COLORS: Record<string, string> = {
  ALIMENTACAO: "#22c55e", // green-500
  MORADIA: "#3b82f6", // blue-500
  LAZER: "#a855f7", // purple-500
  TRANSPORTE: "#f59e0b", // amber-500
  OUTROS: "#6b7280", // gray-500
};

const CATEGORY_LABELS: Record<string, string> = {
  ALIMENTACAO: "Alimentação",
  MORADIA: "Moradia",
  LAZER: "Lazer",
  TRANSPORTE: "Transporte",
  OUTROS: "Outros",
};

function calculateExpensesByCategory(txs: AnyTransaction[]): CategoryData[] {
  const categoryMap = new Map<string, number>();

  txs
    .filter((t) => t.status !== "CANCELLED" && t.status === "PROCESSED")
    .filter((t) => t.type === "withdraw" || t.type === "payment" || t.type === "pix")
    .forEach((t) => {
      const category = t.category || "OUTROS";
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + t.amount);
    });

  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

  if (total === 0) return [];

  const categoryData: CategoryData[] = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
      color: CATEGORY_COLORS[category] || CATEGORY_COLORS.OUTROS,
    }))
    .sort((a, b) => b.amount - a.amount);

  return categoryData;
}

// Função para calcular o path do SVG para cada fatia do donut
function getDonutPath(
  percentage: number,
  startAngle: number,
  radius: number,
  innerRadius: number
): string {
  const angle = (percentage / 100) * 360;
  const endAngle = startAngle + angle;

  const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
  const endAngleRad = ((endAngle - 90) * Math.PI) / 180;

  const x1 = 50 + radius * Math.cos(startAngleRad);
  const y1 = 50 + radius * Math.sin(startAngleRad);
  const x2 = 50 + radius * Math.cos(endAngleRad);
  const y2 = 50 + radius * Math.sin(endAngleRad);

  const x3 = 50 + innerRadius * Math.cos(endAngleRad);
  const y3 = 50 + innerRadius * Math.sin(endAngleRad);
  const x4 = 50 + innerRadius * Math.cos(startAngleRad);
  const y4 = 50 + innerRadius * Math.sin(startAngleRad);

  const largeArc = angle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export default function ExpenseCategoryChart() {
  const txs = useTxStore((s) => s.transactions);
  const categoryData = useMemo(() => calculateExpensesByCategory(txs), [txs]);

  if (categoryData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Despesas por Categoria
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhuma despesa processada encontrada
        </p>
      </Card>
    );
  }

  const radius = 35; // raio externo em porcentagem
  const innerRadius = 20; // raio interno em porcentagem
  let currentAngle = 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Despesas por Categoria
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Gráfico Donut */}
        <div className="flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-48 h-48">
            {categoryData.map((item, index) => {
              const path = getDonutPath(item.percentage, currentAngle, radius, innerRadius);
              const startAngle = currentAngle;
              currentAngle += (item.percentage / 100) * 360;

              return (
                <path
                  key={item.category}
                  d={path}
                  fill={item.color}
                  className="transition-opacity hover:opacity-80"
                  style={{ cursor: "pointer" }}
                />
              );
            })}
          </svg>
        </div>

        {/* Legenda */}
        <div className="flex-1 w-full">
          <div className="space-y-3">
            {categoryData.map((item) => (
              <div key={item.category} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatBRL(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
