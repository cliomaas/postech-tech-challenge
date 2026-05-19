"use client";

import Card from "@/components/ds/Card";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxList from "@/components/TxList";
import { lazy, Suspense, useEffect, useState } from "react";
import { useTxStore } from "@/lib/store";
import { finalizeFromForm } from "@/lib/utils/tx";
import { onTxEvent } from "@/src/mf/events";

const BalanceCard = lazy(() => import("@/components/charts/BalanceCard"));
const IncomeCard = lazy(() => import("@/components/charts/IncomeCard"));
const ExpenseCard = lazy(() => import("@/components/charts/ExpenseCard"));
const HighestExpenseCard = lazy(() => import("@/components/charts/HighestExpenseCard"));
const MonthlyBalanceChart = lazy(() => import("@/components/charts/MonthlyBalanceChart"));
const ExpenseCategoryChart = lazy(() => import("@/components/charts/ExpenseCategoryChart"));
const TxForm = lazy(() => import("@/components/forms/TxForm"));

function ChartFallback({ className = "h-64" }: { className?: string }) {
  return (
    <Card className={`animate-pulse bg-[color:var(--color-surface-50)] ${className}`} />
  );
}

export default function DashboardView() {
  const [open, setOpen] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const add = useTxStore(s => s.add);

  useEffect(() => {
    return onTxEvent(() => {
      setLastSync(new Date().toLocaleTimeString("pt-BR"));
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartFallback className="h-32" />}>
            <BalanceCard />
          </Suspense>
        </div>
        <Suspense fallback={<ChartFallback className="h-32" />}>
          <IncomeCard />
        </Suspense>
        <Suspense fallback={<ChartFallback className="h-32" />}>
          <ExpenseCard />
        </Suspense>
        <Suspense fallback={<ChartFallback className="h-32" />}>
          <HighestExpenseCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Suspense fallback={<ChartFallback />}>
          <MonthlyBalanceChart />
        </Suspense>
        <Suspense fallback={<ChartFallback />}>
          <ExpenseCategoryChart />
        </Suspense>
      </div>

      <div className="grid md:grid-cols-1 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Nova transação
            </h3>
            <Button onClick={() => setOpen(true)}>Adicionar</Button>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Crie uma transação rapidamente.
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Últimas transações</h3>
            {lastSync ? (
              <p className="text-xs text-muted">Sincronizado às {lastSync}</p>
            ) : null}
          </div>
          <a className="text-sm underline" href="/transactions">
            Ver todas
          </a>
        </div>
        <div className="mt-4">
          <TxList />
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-lg font-medium mb-3">Adicionar transação</h3>
        <Suspense fallback={<ChartFallback className="h-80" />}>
          <TxForm
            onSubmit={(form) => {
              const txWithoutId = finalizeFromForm(form);
              add(txWithoutId);
              setOpen(false);
            }}
          />
        </Suspense>
      </Modal>
    </div>
  );
}
