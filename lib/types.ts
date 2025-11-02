export type TransactionType = "deposit" | "transfer" | "payment" | "withdraw" | "pix";
export type TransactionStatus = "processed" | "scheduled" | "manual";
export type PixType = "normal" | "scheduled";
export type PixStatus = "pending" | "sent" | "cancelled" | "failed";

export interface Transaction {
  id: string;
  type: Exclude<TransactionType, "pix">;
  description: string;
  amount: number; // positive numbers; sign decided by type
  date: string; // ISO
  status: TransactionStatus;
}

export interface PixTransaction extends Omit<Transaction, "type" | "status"> {
  type: "pix";
  pixType: PixType;
  scheduledFor?: string; // ISO; only if scheduled
  status: PixStatus;  // lifecycle of PIX
}

export type AnyTransaction = Transaction | PixTransaction;