"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import type { AnyTransaction } from "@/lib/types";
import { getTxActionState } from "@/lib/utils/tx-actions";
import { finalizeFromForm } from "@/lib/utils/tx";
import Badge from "./ds/Badge";
import { useSnackbar } from "@/components/ds/SnackbarProvider";
import { brDateFromAny, txRawDate } from "@/lib/utils/date";
import { formatBRL } from "@/src/core/money";
import { DEFAULT_FILTERS, type Filters, TxFilters } from "./TxFilters";
import { txLabel as tLabel } from "@/src/core/labels";
import { openAttachment } from "@/lib/utils/attachments";
import { useTxStore } from "@/lib/store";

const PAGE_SIZE = 10;

export default function TxTable() {
  const snackbar = useSnackbar();
  const transactions = useTxStore((s) => s.transactions);
  const loading = useTxStore((s) => s.loading);
  const fetchAll = useTxStore((s) => s.fetchAll);
  const add = useTxStore((s) => s.add);
  const patch = useTxStore((s) => s.patch);
  const cancel = useTxStore((s) => s.cancel);
  const restore = useTxStore((s) => s.restore);
  const setNotifier = useTxStore((s) => s.setNotifier);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersState, setFiltersState] = useState({ query: "", filters: DEFAULT_FILTERS });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasMoreRef = useRef(true);
  const [edit, setEdit] = useState<AnyTransaction | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const negativeTypes = new Set<AnyTransaction["type"]>(["withdraw", "payment", "pix"]);

  const loadAll = useCallback(async () => {
    try {
      await fetchAll();
    } catch (err) {
      snackbar.error("Erro ao carregar transações");
    } finally {
      setHasLoadedOnce(true);
    }
  }, [fetchAll, snackbar]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    setNotifier({ success: snackbar.success, error: snackbar.error });
    return () => setNotifier(undefined);
  }, [setNotifier, snackbar]);

  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || !hasMoreRef.current) return;
      setPage((prev) => prev + 1);
    }, { rootMargin: "200px" });
    if (node) observerRef.current.observe(node);
  }, []);

  const handleFiltersChange = useCallback((next: { query: string; filters: Filters }) => {
    setFiltersState((prev) => {
      const prevKey = JSON.stringify(prev);
      const nextKey = JSON.stringify(next);
      if (prevKey === nextKey) return prev;
      setPage(1);
      return next;
    });
  }, []);

  const handleCancel = useCallback(async (id: string) => {
    try {
      await cancel(id);
    } catch {
      snackbar.error("Erro ao cancelar transação");
    }
  }, [cancel, snackbar]);

  const handleRestore = useCallback(async (id: string) => {
    try {
      await restore(id);
    } catch {
      snackbar.error("Erro ao restaurar transação");
    }
  }, [restore, snackbar]);

  return (
    <div className="space-y-3">
      <TxFilters
        transactions={transactions as any}
        onOpenCreate={() => setCreateOpen(true)}
        onRefresh={() => {
          setPage(1);
          loadAll();
        }}
        onFiltersChange={handleFiltersChange}
      >
        {(filteredTransactions) => {
          const sortedTransactions = [...(filteredTransactions as AnyTransaction[])].sort((a, b) => {
            const aTime = +new Date(txRawDate(a as any));
            const bTime = +new Date(txRawDate(b as any));
            return bTime - aTime;
          });
          const visibleTransactions = sortedTransactions.slice(0, page * PAGE_SIZE);
          hasMoreRef.current = visibleTransactions.length < filteredTransactions.length;
          return (
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
                    <Th>Categoria</Th>
                    <Th right>Valor</Th>
                    <Th>Status</Th>
                    <Th right>Ações</Th>
                  </tr>
                </thead>

                <tbody className="text-fg">
                  {visibleTransactions.map((t, idx) => {
                    const raw = txRawDate(t as any);
                    const date = brDateFromAny(raw);
                    const negative = negativeTypes.has(t.type);
                    const attachment = (t as any).attachments?.[0];

                    const row = clsx(
                      "transition-colors",
                      "border-b border-[var(--color-border)]/60",
                      idx % 2 === 0 ? "bg-[color:var(--color-surface-50)]/40" : "bg-transparent",
                      "hover:bg-[color:var(--color-surface-50)]/80",
                      t.status === "CANCELLED" && "opacity-60 line-through"
                    );

                    return (
                      <tr
                        key={t.id}
                        className={row}
                        aria-disabled={t.status === "CANCELLED"}
                      >
                        <Td>{date}</Td>
                        <Td className="max-w-[28ch] truncate">
                          <div className="flex flex-col gap-1">
                            <span title={t.description} className="truncate">{t.description}</span>
                            {attachment && (
                              <a
                                href={attachment.dataUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(event) => {
                                  event.preventDefault();
                                  openAttachment(attachment);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-[color:var(--color-brand)]"
                              >
                                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">attach_file</span>
                                Ver anexo
                              </a>
                            )}
                          </div>
                        </Td>

                        <Td className="capitalize">{tLabel.type[t.type as keyof typeof tLabel.type] ?? t.type}</Td>
                        <Td>{tLabel.category[t.category as keyof typeof tLabel.category] ?? t.category}</Td>
                        <Td right className={clsx(
                          "tabular-nums font-medium",
                          negative ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"
                        )}>
                          {negative ? "-" : ""}{formatBRL(t.amount)}
                        </Td>
                        <Td>
                          <Badge
                            color={
                              t.status === "PROCESSED"
                                ? "green"
                                : t.status === "PROCESSING"
                                  ? "yellow"
                                  : t.status === "CANCELLED"
                                    ? "red"
                                    : "slate"
                            }
                            title={
                              t.status === "PROCESSING" && (t as any).processingUntil
                                ? `Processando até ${new Date((t as any).processingUntil).toLocaleTimeString("pt-BR")}`
                                : undefined
                            }
                          >
                            {tLabel.status[t.status as keyof typeof tLabel.status] ?? t.status}
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
                                  {t.status === "CANCELLED" ?
                                    t.locked ? null : (
                                      <Button variant="ghost" onClick={() => handleRestore(t.id)}>Restaurar</Button>
                                    ) : (
                                      <Button
                                        variant={deleteDisabled ? "disabled" : "danger"}
                                        disabled={deleteDisabled}
                                        onClick={() => handleCancel(t.id)}
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

                  {loading && filteredTransactions.length === 0 && !hasLoadedOnce && (
                    <tr>
                      <td colSpan={7} className="p-8">
                        <div className="text-center text-fg/70">
                          Carregando...
                        </div>
                      </td>
                    </tr>
                  )}

                  {!loading && hasLoadedOnce && filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8">
                        <div className="text-center text-fg/70">
                          Nenhuma transação encontrada.
                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
              {hasMoreRef.current && <div ref={loadMoreRef} className="h-6" />}
            </div>
          );
        }}
      </TxFilters>

      <Modal open={!!edit} onClose={() => setEdit(null)}>
        <h3 className="text-lg font-medium mb-3">Editar transação</h3>
        {edit && (
          <TxForm
            initial={edit}
            onSubmit={async (form) => {
              const finalized = finalizeFromForm(form);
              try {
                await patch(edit.id, finalized);
                setEdit(null);
              } catch {
                snackbar.error("Erro ao editar transação");
              }
            }}
          />
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <h3 className="text-lg font-medium mb-3">Nova transação</h3>
        <TxForm
          onSubmit={(form) => {
            const txWithoutId = finalizeFromForm(form);
            add(txWithoutId)
              .then(() => {
                setCreateOpen(false);
              })
              .catch(() => {
                snackbar.error("Erro ao criar transação");
              });
          }}
        />
      </Modal>
    </div >
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
