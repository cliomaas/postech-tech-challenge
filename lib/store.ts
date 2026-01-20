"use client";
import { create, type StateCreator } from "zustand";
import type { AnyTransaction, TransactionStatus } from "./types";
import { listTransactions, createTransaction, updateTransaction, deleteTransaction, cancelTransaction, restoreTransaction } from "./backend";

type TxWithRuntime = AnyTransaction & { processingUntil?: string; previousStatus?: TransactionStatus; cancelledAt?: string, locked?: boolean; };

type Notifier = { success?: (msg: string) => void; error?: (msg: string) => void };

type State = {
  transactions: TxWithRuntime[];
  loading: boolean;
  fetchAll: (q?: string) => Promise<void>;
  add: (t: Omit<AnyTransaction, "id"> & { processingUntil?: string }) => Promise<void>;
  patch: (id: string, p: Partial<Omit<AnyTransaction, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  setNotifier: (n?: Notifier) => void;
  notifier?: Notifier;
};

let timerId: ReturnType<typeof setTimeout> | null = null;

function parseISO(s?: string) {
  return s ? new Date(s) : null;
}

function scheduleNextSweep(get: () => State, set: (partial: Partial<State>) => void) {
  if (timerId) clearTimeout(timerId);
  const pending = get().transactions
    .filter(t => t.status === "PROCESSING" && t.processingUntil)
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
    t => t.status === "PROCESSING" && t.processingUntil && +new Date(t.processingUntil) <= now
  );
  if (due.length === 0) return;
  const updatedLocal = get().transactions.map(t =>
    due.find(d => d.id === t.id)
      ? { ...t, status: "PROCESSED" as TransactionStatus, processingUntil: undefined }
      : t
  );
  set({ transactions: updatedLocal });
  await Promise.all(due.map(d => updateTransaction(d.id, { status: "PROCESSED" })));
}

const creator: StateCreator<State> = (set, get) => ({
  transactions: [],
  loading: false,
  notifier: undefined,
  setNotifier: n => set({ notifier: n }),

  fetchAll: async q => {
    set({ loading: true });
    const data = (await listTransactions({ q, _sort: "date", _order: "desc" })) as TxWithRuntime[];
    set({ transactions: data, loading: false });
    await sweepProcessing(get, set);
    scheduleNextSweep(get, set);
  },

  add: async t => {
    const created = (await createTransaction(t)) as TxWithRuntime;
    set({ transactions: [created, ...get().transactions] });
    if (created.status === "PROCESSING" && created.processingUntil) {
      scheduleNextSweep(get, set);
    }
  },

  patch: async (id, p) => {
    const updated = (await updateTransaction(id, p)) as TxWithRuntime;
    set({ transactions: get().transactions.map(x => (x.id === id ? updated : x)) });
    scheduleNextSweep(get, set);
  },

  remove: async id => {
    await deleteTransaction(id);
    set({ transactions: get().transactions.filter(x => x.id !== id) });
    scheduleNextSweep(get, set);
  },

  cancel: async id => {
    const prev = get().transactions;
    const t = prev.find(t => t.id === id);
    if (!t) return;
    set({
      transactions: prev.map(x =>
        x.id === id ? { ...x, previousStatus: x.status as TransactionStatus, status: "CANCELLED" as TransactionStatus } : x
      ),
    });
    try {
      await cancelTransaction(id, t.status as TransactionStatus);
    } catch {
      get().notifier?.error?.("Erro ao cancelar transação");
    }
  },

  restore: async id => {
    const prev = get().transactions;
    const tx = prev.find(t => t.id === id);
    if (!tx) return;
    const restoreTo = (tx.previousStatus ?? "scheduled") as TransactionStatus;
    set({
      transactions: prev.map(t =>
        t.id === id ? { ...t, status: restoreTo, previousStatus: undefined } : t
      ),
    });
    await restoreTransaction(id, restoreTo);
    scheduleNextSweep(get, set);
  },
});

export const useTxStore = create<State>()(creator);
