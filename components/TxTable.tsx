"use client";
import { useMemo, useState, useEffect } from "react";
import { clsx } from "clsx";
import { useTxStore } from "@/lib/store";
import { currencyBRL } from "@/lib/utils/currency";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import type { AnyTransaction } from "@/lib/types";
import { getTxActionState } from "@/lib/utils/tx-actions";
import { finalizeFromForm } from "@/lib/utils/tx";
import Badge from "./ds/Badge";
import Input from "./ds/Input";
import { useSnackbar } from "@/components/ds/SnackbarProvider";
import { brDateFromAny, txRawDate } from "@/lib/utils/date";

export default function TxTable() {
  const { transactions, fetchAll, cancel, restore, patch, add, loading, setNotifier } = useTxStore();
  const snackbar = useSnackbar();

  useEffect(() => {
    setNotifier({ success: snackbar.success, error: snackbar.error });
    return () => setNotifier(undefined);
  }, [setNotifier, snackbar]);

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

  const tLabel = {
    type: { deposit: "Depósito", transfer: "Transferência", payment: "Pagamento", withdraw: "Saque", pix: "Pix" },
    status: { scheduled: "Agendado", processing: "Em processamento", processed: "Finalizado", cancelled: "Cancelado", failed: "Falha" }
  } as const;

  const negativeTypes = new Set<AnyTransaction["type"]>(["withdraw", "payment", "pix"]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar por descrição ou tipo"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar transações"
        />
        <Button onClick={() => setCreateOpen(true)}>Nova</Button>
      </div>

      <div
        role="region"
        aria-labelledby="tx-table-title"
        className="overflow-x-auto rounded-[var(--radius-xl2)] border border-[var(--color-border)] bg-surface"
      >
        <table className="min-w-full text-sm">
          <caption id="tx-table-title" className="sr-only">Lista de transações</caption>

          <thead className="sticky top-0 z-10 bg-[var(--color-surface-50)]/85 backdrop-blur text-fg">
            <tr className="border-b border-[var(--color-border)]/60">
              <Th>Data</Th>
              <Th>Descrição</Th>
              <Th>Tipo</Th>
              <Th right>Valor</Th>
              <Th>Status</Th>
              <Th right>Ações</Th>
            </tr>
          </thead>

          <tbody className="text-fg">
            {filtered.map((t, idx) => {
              const raw = txRawDate(t)
              const date = brDateFromAny(raw);
              const negative = negativeTypes.has(t.type);

              const row = clsx(
                "transition-colors",
                "border-b border-[var(--color-border)]/60",
                idx % 2 === 0 ? "bg-[color:var(--color-surface-50)]/40" : "bg-transparent",
                "hover:bg-[color:var(--color-surface-50)]/80",
                t.status === "cancelled" && "opacity-60 line-through"
              );

              return (
                <tr key={t.id} className={row} aria-disabled={t.status === "cancelled"}>
                  <Td>{date}</Td>
                  <Td className="max-w-[28ch] truncate">
                    <span title={t.description}>{t.description}</span>
                  </Td>

                  <Td className="capitalize">{tLabel.type[t.type]}</Td>
                  <Td right className={clsx(
                    "tabular-nums font-medium",
                    negative ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"
                  )}>
                    {negative ? "-" : ""}{currencyBRL(t.amount)}
                  </Td>
                  <Td>
                    <Badge
                      color={
                        t.status === "processed"
                          ? "green"
                          : t.status === "processing"
                            ? "yellow"
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
                      {tLabel.status[t.status]}
                    </Badge>
                  </Td>
                  <Td right>
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
                            {t.status === "cancelled" ? (
                              <Button variant="ghost" onClick={() => restore(t.id)}>Restaurar</Button>
                            ) : (
                              <Button
                                variant={deleteDisabled ? "disabled" : "danger"}
                                disabled={deleteDisabled}
                                onClick={() => cancel(t.id)}
                                title={deleteDisabled ? deleteReason : "Excluir"}
                                aria-disabled={deleteDisabled}
                              >
                                Cancelar
                              </Button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </Td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8">
                  <div className="text-center text-fg/70">
                    Nenhuma transação encontrada.
                  </div>
                </td>
              </tr>
            )}
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
    </div>
  );
}

/* Sub-componentes semânticos para th/td com alinhamento */
function Th({ children, right = false }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={clsx("p-3 text-left text-sm font-semibold", right && "text-right")}>
      {children}
    </th>
  );
}
function Td({ children, className, right = false }: { children: React.ReactNode; className?: string; right?: boolean }) {
  return (
    <td className={clsx("p-3 align-middle", right && "text-right", className)}>{children}</td>
  );
}
