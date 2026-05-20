import { describe, expect, it } from "vitest";
import {
  canDeleteTransaction,
  canEditTransaction,
  getProcessingDueTransactions,
  isExpenseTransactionType,
  markProcessingAsProcessed,
  normalizeTransaction,
  type AnyTransaction,
  type TransactionWithRuntime,
} from "@/lib/domain/transactions";

const baseTransaction: AnyTransaction = {
  id: "tx-1",
  amount: 100,
  date: "2026-05-20",
  type: "payment",
  description: "Conta",
  status: "PROCESSING",
  category: "OUTROS",
};

describe("transaction domain rules", () => {
  it("identifies expense transaction types", () => {
    expect(isExpenseTransactionType("payment")).toBe(true);
    expect(isExpenseTransactionType("withdraw")).toBe(true);
    expect(isExpenseTransactionType("pix")).toBe(true);
    expect(isExpenseTransactionType("deposit")).toBe(false);
  });

  it("normalizes status and category without mutating the transaction", () => {
    const transactionWithoutCategory: Partial<AnyTransaction> = { ...baseTransaction };
    delete transactionWithoutCategory.category;

    const normalized = normalizeTransaction({
      ...transactionWithoutCategory,
      status: "processing" as AnyTransaction["status"],
    } as AnyTransaction);

    expect(normalized.status).toBe("PROCESSING");
    expect(normalized.category).toBe("OUTROS");
    expect(baseTransaction.status).toBe("PROCESSING");
  });

  it("keeps processed transactions locked for editing and deletion", () => {
    const processed = { ...baseTransaction, status: "PROCESSED" as const };

    expect(canEditTransaction(processed)).toBe(false);
    expect(canDeleteTransaction(processed)).toBe(false);
  });

  it("marks due processing transactions as processed", () => {
    const transactions: TransactionWithRuntime[] = [
      {
        ...baseTransaction,
        id: "due",
        processingUntil: "2026-05-20T09:00:00.000Z",
      },
      {
        ...baseTransaction,
        id: "pending",
        processingUntil: "2026-05-20T11:00:00.000Z",
      },
    ];

    const due = getProcessingDueTransactions(
      transactions,
      new Date("2026-05-20T10:00:00.000Z")
    );
    const updated = markProcessingAsProcessed(transactions, due);

    expect(due).toHaveLength(1);
    expect(updated.find((tx) => tx.id === "due")?.status).toBe("PROCESSED");
    expect(updated.find((tx) => tx.id === "due")?.processingUntil).toBeUndefined();
    expect(updated.find((tx) => tx.id === "pending")?.status).toBe("PROCESSING");
  });
});
