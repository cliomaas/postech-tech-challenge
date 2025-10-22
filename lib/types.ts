export type TransactionType = "deposit" | "transfer" | "payment" | "withdraw";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number; // positive numbers; sign decided by type
  date: string; // ISO
}
