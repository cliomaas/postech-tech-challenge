"use client";
import { create } from "zustand";
import type { AnyTransaction, TransactionStatus } from "./types";
import { listTransactions, createTransaction, updateTransaction, deleteTransaction, cancelTransaction, restoreTransaction } from "./api";

type TxWithRuntime = AnyTransaction & { processingUntil?: string, previousStatus?: TransactionStatus, cancelledAt?: string };

type State = {
  transactions: TxWithRuntime[];
  loading: boolean;
  fetchAll: (q?: string) => Promise<void>;
  add: (t: Omit<AnyTransaction, "id"> & { processingUntil?: string }) => Promise<void>;
  patch: (id: string, p: Partial<Omit<AnyTransaction, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
};

let timerId: ReturnType<typeof setTimeout> | null = null;

function parseISO(s?: string) {
  return s ? new Date(s) : null;
}

function scheduleNextSweep(get: () => State, set: (partial: Partial<State>) => void) {
  if (timerId) clearTimeout(timerId);

  const pending = get().transactions
    .filter(t => t.status === "processing" && t.processingUntil)
    .map(t => ({ t, until: parseISO(t.processingUntil!)! }))
    .filter(x => !Number.isNaN(+x.until));

  if (pending.length === 0) return;

  pending.sort((a, b) => +a.until - +b.until);
  const next = pending[0];
  const delay = Math.max(0, +next.until - Date.now());

  timerId = setTimeout(async () => {
    await sweepProcessing(get, set);

    scheduleNextSweep(get, set);
  }, delay);
}

async function sweepProcessing(get: () => State, set: (partial: Partial<State>) => void) {
  const now = Date.now();
  const due = get().transactions.filter(
    (t) => t.status === "processing" && t.processingUntil && +new Date(t.processingUntil) <= now
  );

  if (due.length === 0) return;

  const updatedLocal = get().transactions.map((t) =>
    due.find(d => d.id === t.id)
      ? ({ ...t, status: "processed" as TransactionStatus, processingUntil: undefined })
      : t
  );
  set({ transactions: updatedLocal });

  await Promise.all(
    due.map(d => updateTransaction(d.id, { status: "processed" }))
  );
}

// ---------------------------------

export const useTxStore = create<State>((set, get) => ({
  transactions: [],
  loading: false,

  fetchAll: async (q) => {
    set({ loading: true });
    const data = await listTransactions({ q, _sort: "date", _order: "desc" }) as TxWithRuntime[];
    set({ transactions: data, loading: false });

    await sweepProcessing(get, set);
    scheduleNextSweep(get, set);
  },

  add: async (t) => {
    const created = await createTransaction(t) as TxWithRuntime;
    set({ transactions: [created, ...get().transactions] });

    if (created.status === "processing" && created.processingUntil) {
      scheduleNextSweep(get, set);
    }
  },

  patch: async (id, p) => {
    const updated = await updateTransaction(id, p) as TxWithRuntime;
    set({ transactions: get().transactions.map(x => (x.id === id ? updated : x)) });

    scheduleNextSweep(get, set);
  },

  remove: async (id) => {
    await deleteTransaction(id);
    set({ transactions: get().transactions.filter(x => x.id !== id) });

    scheduleNextSweep(get, set);
  },

  cancel: async (id) => {
    const prev = get().transactions;
    set({
      transactions: prev.map(t => t.id === id ? { ...t, previousStatus: t.status, status: "cancelled" } : t),
    });
    try {
      await cancelTransaction(id);
    } catch (err) {
      console.error("Erro ao cancelar transação:", err);
    }
  },

  restore: async (id: string) => {
    const prev = get().transactions;
    const tx = prev.find(t => t.id === id);
    const restoreTo = tx?.previousStatus ?? "scheduled";

    set({
      transactions: prev.map(t =>
        t.id === id
          ? { ...t, status: restoreTo, previousStatus: undefined }
          : t
      ),
    });
    await restoreTransaction(id);
  },

}));
