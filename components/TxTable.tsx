"use client";
import { useMemo, useState, useEffect } from "react";
import { useTxStore } from "@/lib/store";
import { currencyBRL } from "@/lib/utils/currency";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import type { AnyTransaction } from "@/lib/types";
import { canDeleteTransaction, canEditTransaction } from "@/lib/utils/tx-rules";
import { finalizeFromForm } from "@/lib/utils/tx";
import { getTxActionState } from "@/lib/utils/tx-actions";
import Badge from "./ds/Badge";

export default function TxTable() {
  const { transactions, fetchAll, cancel, restore, patch, add, loading } = useTxStore();
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

  const transactionTranslation = {
    type: {
      "deposit": "Depósito",
      "transfer": "Transferência",
      "payment": "Pagamento",
      "withdraw": "Saque",
      "pix": "Pix"
    },
    status: {
      "scheduled": "Agendado",
      "processing": "Em processamento",
      "processed": "Finalizado",
      "cancelled": "Cancelado",
      "failed": "Falha"
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          placeholder="Buscar por descrição ou tipo:"
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
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const date = new Date(t.date).toLocaleDateString("pt-BR");
              const negative = t.type === "withdraw" || t.type === "payment" || t.type === "pix";
              return (
                <tr key={t.id}
                  className={"border-t border-white/5" + (t.status === "cancelled" ? "opacity-60 line-through" : "")}
                  aria-disabled={t.status === "cancelled"}>
                  <td className="p-3">{date}</td>
                  <td className="p-3">{t.description}</td>
                  <td className="p-3 capitalize">{transactionTranslation.type[t.type]}</td>
                  <td className="p-3 text-right">{negative ? "-" : ""}{currencyBRL(t.amount)}</td>
                  <td className="p-3">
                    <Badge
                      color={
                        t.status === "processed"
                          ? "green"
                          : t.status === "processing"
                            ? "yellow"
                            : t.status === "scheduled"
                              ? "slate"
                              : t.status === "cancelled"
                                ? "red"
                                : "slate"
                      }
                      title={
                        t.status === "processing" && (t as any).processingUntil
                          ? `Processando até ${new Date((t as any).processingUntil).toLocaleTimeString("pt-BR")}`
                          : undefined
                      }
                    >
                      {transactionTranslation.status[t.status]}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-2">
                      {(() => {
                        const { editDisabled, deleteDisabled, editReason, deleteReason } = getTxActionState(t);

                        return (
                          <>
                            <Button
                              variant={editDisabled ? "disabled" : "ghost"}
                              disabled={editDisabled}
                              onClick={() => setEdit(t)}
                              title={editDisabled ? editReason : "Editar"}
                              aria-disabled={editDisabled}
                            >
                              Editar
                            </Button>
                            {t.status === "cancelled" ? <Button variant="ghost" onClick={() => restore(t.id)}>Restaurar</Button> :
                              <Button
                                variant={deleteDisabled ? "disabled" : "danger"}
                                disabled={deleteDisabled}
                                onClick={() => cancel(t.id)}
                                title={deleteDisabled ? deleteReason : "Excluir"}
                                aria-disabled={deleteDisabled}
                              >
                                Cancelar
                              </Button>
                            }
                          </>
                        );
                      })()}
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
            onSubmit={async (form) => {
              const finalized = finalizeFromForm(form);
              await patch(edit.id, finalized);
              setEdit(null);
            }}
          />
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h3 className="text-lg font-medium mb-3">Nova transação</h3>
        <TxForm
          onSubmit={(form) => {
            const txWithoutId = finalizeFromForm(form);
            add(txWithoutId);
            setCreateOpen(false);
          }}
        />
      </Modal>
    </div >
  );
}
