export type TransactionType = "deposit" | "transfer" | "payment" | "withdraw" | "pix";
export type TransactionStatus = "scheduled" | "processing" | "processed" | "cancelled" | "failed";
export type PixType = "normal" | "scheduled";

export interface Transaction {
  id: string;
  type: Exclude<TransactionType, "pix">;
  description: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  status: TransactionStatus;
}

export interface PixTransaction extends Omit<Transaction, "type"> {
  type: "pix";
  pixType: PixType;
  scheduledFor?: string; // ISO when scheduled
}

export type AnyTransaction = Transaction | PixTransaction;
