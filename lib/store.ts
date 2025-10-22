"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, TransactionType } from "./types";
import seed from "@/data/transactions.json";

type State = {
  transactions: Transaction[];
  add: (t: Omit<Transaction, "id">) => void;
  update: (id: string, patch: Partial<Omit<Transaction, "id">>) => void;
  remove: (id: string) => void;
  get: (id: string) => Transaction | undefined;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export const useTxStore = create<State>()(
  persist(
    (set, get) => ({
      transactions: seed,
      add: (t) => set((s) => ({ transactions: [{ id: `t-${uid()}`, ...t }, ...s.transactions] })),
      update: (id, patch) => set((s) => ({
        transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
      remove: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      get: (id) => get().transactions.find((x) => x.id === id),
    }),
    { name: "postech-tx" }
  )
);
