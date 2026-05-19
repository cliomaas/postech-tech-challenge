import type {
  ListTransactionsParams,
  TransactionRepository,
} from "@/lib/application/transactions";
import type { AnyTransaction, TransactionStatus } from "@/lib/domain/transactions";
import { normalizeTransaction } from "@/lib/domain/transactions";
import { getApiBase } from "@/lib/env";

const BASE = getApiBase();

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function buildTransactionsParams(opts?: ListTransactionsParams) {
  const params = new URLSearchParams();
  if (opts?.q) params.set("q", opts.q);
  if (opts?.type) params.set("type", opts.type);
  if (opts?.status) params.set("status", opts.status);
  if (opts?.category) params.set("category", opts.category);
  if (opts?._sort) params.set("_sort", opts._sort);
  if (opts?._order) params.set("_order", opts._order);
  if (opts?._limit) params.set("_limit", String(opts._limit));
  if (opts?._page && opts?._limit) {
    params.set("_start", String((opts._page - 1) * opts._limit));
  } else if (opts?._page) {
    params.set("_page", String(opts._page));
  }
  return params;
}

export class HttpTransactionRepository implements TransactionRepository {
  async list(opts?: ListTransactionsParams, signal?: AbortSignal) {
    const params = buildTransactionsParams(opts);
    const res = await fetch(`${BASE}/transactions?${params.toString()}`, {
      cache: "no-store",
      signal,
    });
    const data = await parseJson<AnyTransaction[]>(res);
    return data.map(normalizeTransaction);
  }

  async create(input: Omit<AnyTransaction, "id">) {
    const res = await fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const tx = await parseJson<AnyTransaction>(res);
    return normalizeTransaction(tx);
  }

  async update(id: string, patch: Partial<Omit<AnyTransaction, "id">>) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const tx = await parseJson<AnyTransaction>(res);
    return normalizeTransaction(tx);
  }

  async delete(id: string) {
    const res = await fetch(`${BASE}/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  }

  async cancel(id: string, previousStatus: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", previousStatus }),
    });
    const tx = await parseJson<AnyTransaction>(res);
    return normalizeTransaction(tx);
  }

  async restore(id: string, status: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, previousStatus: undefined }),
    });
    const tx = await parseJson<AnyTransaction>(res);
    return normalizeTransaction(tx);
  }
}

export const transactionRepository = new HttpTransactionRepository();

export const listTransactions = transactionRepository.list.bind(transactionRepository);
export const createTransaction = transactionRepository.create.bind(transactionRepository);
export const updateTransaction = transactionRepository.update.bind(transactionRepository);
export const deleteTransaction = transactionRepository.delete.bind(transactionRepository);
export const cancelTransaction = transactionRepository.cancel.bind(transactionRepository);
export const restoreTransaction = transactionRepository.restore.bind(transactionRepository);

