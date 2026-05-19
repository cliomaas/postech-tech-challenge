import type { Transaction } from "@/src/core/transaction";

export type { Transaction, TransactionStatus, TransactionCategory } from "@/src/core/transaction";

export type TransactionType = "deposit" | "transfer" | "payment" | "withdraw" | "pix";
export type PixType = "normal" | "scheduled";

export interface PixTransaction extends Omit<Transaction, "type"> {
  type: "pix";
  pixType: PixType;
  scheduledFor?: string;
}

export type AnyTransaction = Transaction | PixTransaction;

export type TransactionRuntimeFields = {
  processingUntil?: string;
  previousStatus?: Transaction["status"];
  cancelledAt?: string;
  locked?: boolean;
};

export type TransactionWithRuntime = AnyTransaction & TransactionRuntimeFields;

export type ListTransactionsParams = {
  q?: string;
  type?: string;
  status?: string;
  category?: string;
  _sort?: string;
  _order?: "asc" | "desc";
  _page?: number;
  _limit?: number;
};

