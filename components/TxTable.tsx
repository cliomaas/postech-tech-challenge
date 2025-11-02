"use client";
import { useMemo, useState, useEffect } from "react";
import { useTxStore } from "@/lib/store";
import { currencyBRL } from "@/lib/utils/currency";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import type { AnyTransaction } from "@/lib/types";
import { canEditTransaction } from "@/lib/utils/pix";

export default function TxTable() {
  const { transactions, fetchAll, remove, patch, add, loading } = useTxStore();
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<AnyTransaction | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return transactions.filter(t =>
      t.description.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)
    );
  }, [transactions, query]);


  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          placeholder="Buscar por descrição ou tipo"
          className="w-full rounded-xl2 bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar transações"
        />
        <Button onClick={() => setCreateOpen(true)}>Nova</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-right p-3">Valor</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const date = new Date(t.date).toLocaleDateString("pt-BR");
              const negative = t.type === "withdraw" || t.type === "payment" || t.type === "pix";
              return (
                <tr key={t.id} className="border-t border-white/5">
                  <td className="p-3">{date}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className="p-3 text-right">{negative ? "-" : ""}{currencyBRL(t.amount)}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      {canEditTransaction(t) && (
                        <><Button variant="ghost" onClick={() => setEdit(t)}>Editar</Button><Button variant="danger" onClick={() => remove(t.id)}>Excluir</Button></>
                      )
                      }
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={!!edit} onClose={() => setEdit(null)}>
        <h3 className="text-lg font-medium mb-3">Editar transação</h3>
        {edit && (
          <TxForm
            initial={edit}
            onSubmit={async (data) => {
              await patch(edit.id, data);
              setEdit(null);
            }}
          />
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h3 className="text-lg font-medium mb-3">Nova transação</h3>
        <TxForm
          onSubmit={(data) => {
            add({ ...data, status: "processed" });
            setCreateOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
