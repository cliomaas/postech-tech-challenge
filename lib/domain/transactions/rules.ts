import type { AnyTransaction } from "./types";
import { dayStartTsFromAny, getTodayISO } from "@/lib/utils/date";

export type TransactionRuntimeFlags = {
  processingUntil?: string;
  previousStatus?: AnyTransaction["status"];
  cancelledAt?: string;
  locked?: boolean;
};

export type TransactionWithRuntime = AnyTransaction & TransactionRuntimeFlags;

export function isExpenseTransactionType(type: AnyTransaction["type"]) {
  return type === "withdraw" || type === "payment" || type === "pix";
}

export function canEditTransaction(t: AnyTransaction) {
  if (t.status === "SCHEDULED") return true;
  if (t.status === "PROCESSING") return true;
  return false;
}

export function canDeleteTransaction(t: AnyTransaction) {
  if (t.status === "SCHEDULED") return true;
  if (t.status === "PROCESSING") return true;
  return t.status === "CANCELLED" || t.status === "FAILED";
}

export function isExpiredScheduled(tx: TransactionWithRuntime) {
  if (tx.status !== "SCHEDULED") return false;
  if (!("scheduledFor" in tx) || !tx.scheduledFor) return false;

  const todayStart = dayStartTsFromAny(getTodayISO());
  const scheduledStart = dayStartTsFromAny(tx.scheduledFor);

  return scheduledStart < todayStart;
}

export function normalizeTransaction(tx: AnyTransaction): TransactionWithRuntime {
  const normalized = {
    ...tx,
    category: isExpenseTransactionType(tx.type) ? (tx.category ?? "OUTROS") : "INCOME",
    status: typeof tx.status === "string" ? tx.status.toUpperCase() : tx.status,
  } as TransactionWithRuntime;

  if (isExpiredScheduled(normalized)) {
    return {
      ...normalized,
      status: "CANCELLED",
      previousStatus: normalized.status,
      locked: true,
    };
  }

  return normalized;
}

export function getProcessingDueTransactions(
  transactions: TransactionWithRuntime[],
  now: Date = new Date()
) {
  const nowMs = now.getTime();
  return transactions.filter(
    (t) =>
      t.status === "PROCESSING" &&
      t.processingUntil &&
      +new Date(t.processingUntil) <= nowMs
  );
}

export function markProcessingAsProcessed(
  transactions: TransactionWithRuntime[],
  due: TransactionWithRuntime[]
) {
  const dueIds = new Set(due.map((tx) => tx.id));
  return transactions.map((tx) =>
    dueIds.has(tx.id)
      ? { ...tx, status: "PROCESSED" as const, processingUntil: undefined }
      : tx
  );
}
