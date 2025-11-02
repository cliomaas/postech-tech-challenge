"use client";
import { create } from "zustand";
import type { AnyTransaction } from "./types";
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from "./api";

type State = {
  transactions: AnyTransaction[];
  loading: boolean;
  fetchAll: (q?: string) => Promise<void>;
  add: (t: Omit<AnyTransaction, "id">) => Promise<void>;
  patch: (id: string, p: Partial<Omit<AnyTransaction, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useTxStore = create<State>((set, get) => ({
  transactions: [],
  loading: false,

  fetchAll: async (q) => {
    set({ loading: true });
    const data = await listTransactions({ q, _sort: "date", _order: "desc" });
    set({ transactions: data, loading: false });
  },

  add: async (t) => {
    const created = await createTransaction(t);
    set({ transactions: [created, ...get().transactions] });
  },

  patch: async (id, p) => {
    const updated = await updateTransaction(id, p);
    set({ transactions: get().transactions.map(x => (x.id === id ? updated : x)) });
  },

  remove: async (id) => {
    await deleteTransaction(id);
    set({ transactions: get().transactions.filter(x => x.id !== id) });
  },
}));
