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

