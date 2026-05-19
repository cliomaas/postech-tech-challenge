"use client";

import { create, type StateCreator } from "zustand";
import type {
  AnyTransaction,
  TransactionStatus,
  TransactionWithRuntime,
} from "@/lib/domain/transactions";
import {
  cancelTransactionUseCase,
  createTransactionUseCase,
  deleteTransactionUseCase,
  listTransactionsUseCase,
  restoreTransactionUseCase,
  sweepProcessingTransactionsUseCase,
  updateTransactionUseCase,
} from "@/lib/application/transactions";
import { transactionRepository } from "@/lib/infra/transactions";
import { emitTxEvent } from "@/src/mf/events";

type Notifier = { success?: (msg: string) => void; error?: (msg: string) => void };

type State = {
  transactions: TransactionWithRuntime[];
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

  const pending = get()
    .transactions.filter((t) => t.status === "PROCESSING" && t.processingUntil)
    .map((t) => ({ t, until: parseISO(t.processingUntil!)! }))
    .filter((x) => !Number.isNaN(+x.until));

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
  const result = await sweepProcessingTransactionsUseCase(
    transactionRepository,
    get().transactions
  );

  if (result.due.length > 0) {
    set({ transactions: result.transactions });
  }
}

const creator: StateCreator<State> = (set, get) => ({
  transactions: [],
  loading: false,
  notifier: undefined,
  setNotifier: (n) => set({ notifier: n }),

  fetchAll: async (q) => {
    set({ loading: true });
    try {
      const data = await listTransactionsUseCase(transactionRepository, {
        q,
        _sort: "date",
        _order: "desc",
      });
      set({ transactions: data, loading: false });
      await sweepProcessing(get, set);
      scheduleNextSweep(get, set);
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  add: async (t) => {
    const created = await createTransactionUseCase(transactionRepository, t);
    set({ transactions: [created, ...get().transactions] });
    emitTxEvent({ type: "tx:created", id: created.id });

    if (created.status === "PROCESSING" && created.processingUntil) {
      scheduleNextSweep(get, set);
    }
  },

  patch: async (id, p) => {
    const updated = await updateTransactionUseCase(transactionRepository, id, p);
    set({ transactions: get().transactions.map((x) => (x.id === id ? updated : x)) });
    emitTxEvent({ type: "tx:updated", id });
    scheduleNextSweep(get, set);
  },

  remove: async (id) => {
    await deleteTransactionUseCase(transactionRepository, id);
    set({ transactions: get().transactions.filter((x) => x.id !== id) });
    emitTxEvent({ type: "tx:removed", id });
    scheduleNextSweep(get, set);
  },

  cancel: async (id) => {
    const prev = get().transactions;
    const tx = prev.find((t) => t.id === id);
    if (!tx) return;

    set({
      transactions: prev.map((x) =>
        x.id === id
          ? {
              ...x,
              previousStatus: x.status as TransactionStatus,
              status: "CANCELLED" as TransactionStatus,
            }
          : x
      ),
    });

    try {
      await cancelTransactionUseCase(transactionRepository, id, tx.status as TransactionStatus);
      emitTxEvent({ type: "tx:cancelled", id });
    } catch (error) {
      get().notifier?.error?.("Erro ao cancelar transação");
      throw error;
    }
  },

  restore: async (id) => {
    const prev = get().transactions;
    const tx = prev.find((t) => t.id === id);
    if (!tx) return;

    const restoreTo = (tx.previousStatus ?? "SCHEDULED") as TransactionStatus;
    set({
      transactions: prev.map((t) =>
        t.id === id ? { ...t, status: restoreTo, previousStatus: undefined } : t
      ),
    });

    await restoreTransactionUseCase(transactionRepository, id, restoreTo);
    emitTxEvent({ type: "tx:restored", id });
    scheduleNextSweep(get, set);
  },
});

export const useTxStore = create<State>()(creator);

