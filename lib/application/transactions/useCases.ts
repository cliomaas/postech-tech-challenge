import type {
  AnyTransaction,
  ListTransactionsParams,
  TransactionStatus,
  TransactionWithRuntime,
} from "@/lib/domain/transactions";
import {
  getProcessingDueTransactions,
  markProcessingAsProcessed,
} from "@/lib/domain/transactions";
import type { TransactionRepository } from "./transactionRepository";

export async function listTransactionsUseCase(
  repository: TransactionRepository,
  params?: ListTransactionsParams,
  signal?: AbortSignal
) {
  return repository.list(params, signal);
}

export async function createTransactionUseCase(
  repository: TransactionRepository,
  input: Omit<AnyTransaction, "id">
) {
  return repository.create(input);
}

export async function updateTransactionUseCase(
  repository: TransactionRepository,
  id: string,
  patch: Partial<Omit<AnyTransaction, "id">>
) {
  return repository.update(id, patch);
}

export async function deleteTransactionUseCase(
  repository: TransactionRepository,
  id: string
) {
  return repository.delete(id);
}

export async function cancelTransactionUseCase(
  repository: TransactionRepository,
  id: string,
  previousStatus: TransactionStatus
) {
  return repository.cancel(id, previousStatus);
}

export async function restoreTransactionUseCase(
  repository: TransactionRepository,
  id: string,
  status: TransactionStatus
) {
  return repository.restore(id, status);
}

export async function sweepProcessingTransactionsUseCase(
  repository: TransactionRepository,
  transactions: TransactionWithRuntime[],
  now: Date = new Date()
) {
  const due = getProcessingDueTransactions(transactions, now);
  if (due.length === 0) {
    return { due, transactions };
  }

  const updatedTransactions = markProcessingAsProcessed(transactions, due);
  await Promise.all(
    due.map((tx) => repository.update(tx.id, { status: "PROCESSED" }))
  );

  return { due, transactions: updatedTransactions };
}

