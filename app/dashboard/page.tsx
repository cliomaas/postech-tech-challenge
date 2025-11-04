"use client";
import BalanceCard from "@/components/charts/BalanceCard";
import Card from "@/components/ds/Card";
import Button from "@/components/ds/Button";
import TxTable from "@/components/TxTable";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import { useState } from "react";
import { useTxStore } from "@/lib/store";
import { finalizeFromForm } from "@/lib/utils/tx";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const add = useTxStore(s => s.add);
  const txs = useTxStore(s => s.transactions).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <BalanceCard />
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
          <h3 className="text-lg font-medium">Últimas transações</h3>
          <a className="text-sm underline" href="/transactions">Ver todas</a>
        </div>
        <div className="mt-4">
          <TxTable />
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-lg font-medium mb-3">Adicionar transação</h3>
        <TxForm
          onSubmit={(form) => {
            const txWithoutId = finalizeFromForm(form);
            add(txWithoutId);
            setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
