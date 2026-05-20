import type { TransactionRepository } from "@/lib/application/transactions";
import type {
  AnyTransaction,
  ListTransactionsParams,
  TransactionStatus,
  TransactionWithRuntime,
} from "@/lib/domain/transactions";
import { normalizeTransaction } from "@/lib/domain/transactions";
import { getApiBase } from "@/lib/env";

const BASE = getApiBase();
const CACHE_TTL_MS = 30_000;

type CacheEntry<T> = {
  expiresAt: number;
  data: T;
};

const listCache = new Map<string, CacheEntry<TransactionWithRuntime[]>>();
const transactionCache = new Map<string, CacheEntry<TransactionWithRuntime>>();

function isFresh<T>(entry?: CacheEntry<T>) {
  return Boolean(entry && entry.expiresAt > Date.now());
}

function cloneTransaction(tx: TransactionWithRuntime): TransactionWithRuntime {
  return { ...tx };
}

function cacheFor<T>(data: T): CacheEntry<T> {
  return {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
}

function clearTransactionCache() {
  listCache.clear();
  transactionCache.clear();
}

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
    const cacheKey = params.toString();
    const cached = listCache.get(cacheKey);

    if (isFresh(cached)) {
      return cached!.data.map(cloneTransaction);
    }

    const res = await fetch(`${BASE}/transactions?${params.toString()}`, {
      cache: "no-store",
      signal,
    });
    const data = await parseJson<AnyTransaction[]>(res);
    const transactions = data.map(normalizeTransaction);
    listCache.set(cacheKey, cacheFor(transactions));
    return transactions.map(cloneTransaction);
  }

  async get(id: string) {
    const cached = transactionCache.get(id);

    if (isFresh(cached)) {
      return cloneTransaction(cached!.data);
    }

    const res = await fetch(`${BASE}/transactions/${id}`, { cache: "no-store" });
    const tx = await parseJson<AnyTransaction>(res);
    const transaction = normalizeTransaction(tx);
    transactionCache.set(id, cacheFor(transaction));
    return cloneTransaction(transaction);
  }

  async create(input: Omit<AnyTransaction, "id">) {
    const res = await fetch(`${BASE}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const tx = await parseJson<AnyTransaction>(res);
    clearTransactionCache();
    return normalizeTransaction(tx);
  }

  async update(id: string, patch: Partial<Omit<AnyTransaction, "id">>) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const tx = await parseJson<AnyTransaction>(res);
    clearTransactionCache();
    return normalizeTransaction(tx);
  }

  async delete(id: string) {
    const res = await fetch(`${BASE}/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    clearTransactionCache();
  }

  async cancel(id: string, previousStatus: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled", previousStatus }),
    });
    const tx = await parseJson<AnyTransaction>(res);
    clearTransactionCache();
    return normalizeTransaction(tx);
  }

  async restore(id: string, status: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, previousStatus: undefined }),
    });
    const tx = await parseJson<AnyTransaction>(res);
    clearTransactionCache();
    return normalizeTransaction(tx);
  }
}

export const transactionRepository = new HttpTransactionRepository();

export async function listTransactions(
  opts?: ListTransactionsParams,
  signal?: AbortSignal
): Promise<TransactionWithRuntime[]> {
  return transactionRepository.list(opts, signal);
}

export async function getTransaction(id: string) {
  return transactionRepository.get(id);
}

export async function createTransaction(input: Omit<AnyTransaction, "id">) {
  return transactionRepository.create(input);
}

export async function updateTransaction(
  id: string,
  patch: Partial<Omit<AnyTransaction, "id">>
) {
  return transactionRepository.update(id, patch);
}

export async function deleteTransaction(id: string) {
  return transactionRepository.delete(id);
}

export async function cancelTransaction(id: string, previousStatus: TransactionStatus) {
  return transactionRepository.cancel(id, previousStatus);
}

export async function restoreTransaction(id: string, status: TransactionStatus) {
  return transactionRepository.restore(id, status);
}
