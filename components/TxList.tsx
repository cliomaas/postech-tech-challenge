"use client";

import { Fragment, useEffect, useState } from "react";
import { clsx } from "clsx";
import { useTxStore } from "@/lib/store";
import Button from "@/components/ds/Button";
import Modal from "@/components/ds/Modal";
import TxForm from "@/components/forms/TxForm";
import type { AnyTransaction } from "@/lib/types";
import { getTxActionState } from "@/lib/utils/tx-actions";
import { finalizeFromForm } from "@/lib/utils/tx";
import { useSnackbar } from "@/components/ds/SnackbarProvider";
import Badge from "./ds/Badge";
import { formatBRL } from "@/src/core/money";
import { TxFilters } from "./TxFilters";
import { brDateFromAny, dayStartTsFromAny } from "@/lib/utils/date";
import { txLabel as tLabel } from "@/src/core/labels";
import { openAttachment } from "@/lib/utils/attachments";


const negativeTypes = new Set<AnyTransaction["type"]>(["withdraw", "payment", "pix"]);
type TxGroup = { dateKey: string; time: number; items: AnyTransaction[]; total: number };

function txRawDate(t: { date: string; status: string; scheduledFor?: string | null }) {
    return t.status === "scheduled" && t.scheduledFor ? t.scheduledFor : t.date;
}

export default function TxList() {
    const { transactions, fetchAll, cancel, restore, patch, add, loading, setNotifier } = useTxStore();
    const snackbar = useSnackbar();

    useEffect(() => {
        setNotifier({ success: snackbar.success, error: snackbar.error });
        return () => setNotifier(undefined);
    }, [setNotifier, snackbar]);

    const [edit, setEdit] = useState<AnyTransaction | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [hiddenCancelled, setHiddenCancelled] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return (
        <div className="space-y-3">
            <TxFilters transactions={transactions as any} onOpenCreate={() => setCreateOpen(true)}>
                {(filteredTransactions) => {
                    const grouped: TxGroup[] = (() => {
                        const map = new Map<string, TxGroup>();
                        for (const t of filteredTransactions as AnyTransaction[]) {
                            if (hiddenCancelled.has(t.id)) continue;

                            const raw = txRawDate(t as any);
                            const dateKey = brDateFromAny(raw);
                            const time = dayStartTsFromAny(raw);
                            const signed = negativeTypes.has(t.type) ? -t.amount : t.amount;

                            const g = map.get(dateKey);
                            if (g) {
                                g.items.push(t);
                                g.total += signed;
                            } else {
                                map.set(dateKey, { dateKey, time, items: [t], total: signed });
                            }
                        }
                        return Array.from(map.values()).sort((a, b) => b.time - a.time);
                    })();

                    return (
                        <div className="rounded-[var(--radius-xl2)] border border-[var(--color-border)] bg-surface">
                            {grouped.slice(0, 5).map((g, gi) => (
                                <Fragment key={g.dateKey}>
                                    <div
                                        className={clsx(
                                            "px-4 py-2 text-xs font-medium tracking-wide flex items-center justify-between",
                                            gi === 0 ? "rounded-t-[var(--radius-xl2)]" : "",
                                            "bg-[color:var(--color-surface-50)]/70 border-b border-[var(--color-border)]/60"
                                        )}
                                    >
                                        <span>{g.dateKey}</span>
                                        <span
                                            className={clsx(
                                                "tabular-nums font-semibold",
                                                g.total < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"
                                            )}
                                            title="Total do dia"
                                        >
                                            {g.total < 0 ? "-" : ""}
                                            {formatBRL(Math.abs(g.total))}
                                        </span>
                                    </div>

                                    <ul className="divide-y divide-[color:var(--color-border)]/60">
                                        {g.items.map((t) => {
                                            if (hiddenCancelled.has(t.id)) return null;

                                            const negative = negativeTypes.has(t.type);
                                            const { editDisabled, deleteDisabled } = getTxActionState(t);
                                            const attachment = (t as any).attachments?.[0];

                                            return (
                                                <li key={t.id}>
                                                    <div
                                                        className={clsx(
                                                            "group flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 py-3",
                                                            "hover:bg-[color:var(--color-surface-50)]/80 transition-colors",
                                                            t.status === "CANCELLED" && "opacity-60"
                                                        )}
                                                    >
                                                        {t.status === "CANCELLED" && (
                                                            <div className="flex items-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setHiddenCancelled(new Set(hiddenCancelled).add(t.id));
                                                                    }}
                                                                    title="Ocultar"
                                                                    className="text-fg/60 hover:text-fg transition-colors text-lg leading-none"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className={clsx("grow sm:grow-0 min-w-0", t.status === "CANCELLED" && "line-through")}>
                                                            <div className="text-base font-medium truncate">{t.description}</div>
                                                            <div className="text-xs">
                                                                <span className="font-medium text-fg">
                                                                    {tLabel.type[t.type as keyof typeof tLabel.type] ?? t.type}
                                                                </span>

                                                                {t.category !== "INCOME" && (
                                                                    <>
                                                                        <span className="mx-1 opacity-50">·</span>
                                                                        <span className="font-medium text-fg">
                                                                            {tLabel.category[t.category as keyof typeof tLabel.category] ?? t.category}
                                                                        </span>
                                                                    </>
                                                                )}

                                                                <span className="mx-1 opacity-50">·</span>

                                                                {t.status && (
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
                                                                )}
                                                            </div>
                                                            {attachment && (
                                                                <a
                                                                    href={attachment.dataUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(event) => {
                                                                        event.preventDefault();
                                                                        openAttachment(attachment);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 text-xs text-[color:var(--color-brand)] mt-1"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                                                        attach_file
                                                                    </span>
                                                                    Ver anexo
                                                                </a>
                                                            )}
                                                        </div>

                                                        <div className="ml-auto flex items-center gap-2 sm:gap-3">
                                                            <div
                                                                className={clsx(
                                                                    "tabular-nums font-semibold",
                                                                    negative ? "text-[var(--color-danger)]" : "text-[var(--color-success)]",
                                                                    t.status === "CANCELLED" && "line-through"
                                                                )}
                                                            >
                                                                {negative ? "-" : ""}
                                                                {formatBRL(t.amount)}
                                                            </div>

                                                            <Button
                                                                variant={editDisabled ? "disabled" : "ghost"}
                                                                disabled={editDisabled}
                                                                onClick={() => setEdit(t)}
                                                                title={editDisabled ? "Edição desabilitada" : "Editar transação"}
                                                                aria-disabled={editDisabled}
                                                            >
                                                                Editar
                                                            </Button>

                                                            {t.status === "CANCELLED" ? (
                                                                (t as any).locked ? null : (
                                                                    <Button variant="ghost" onClick={() => restore(t.id)}>
                                                                        Restaurar
                                                                    </Button>
                                                                )
                                                            ) : (
                                                                <Button
                                                                    variant={deleteDisabled ? "disabled" : "danger"}
                                                                    disabled={deleteDisabled}
                                                                    onClick={() => cancel(t.id)}
                                                                    aria-disabled={deleteDisabled}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Fragment>
                            ))}

                            {!loading && grouped.length === 0 && (
                                <div className="p-8 text-center text-fg/70">Nenhuma transação encontrada.</div>
                            )}
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
