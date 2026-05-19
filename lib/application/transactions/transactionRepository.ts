import type {
  AnyTransaction,
  TransactionStatus,
  TransactionWithRuntime,
} from "@/lib/domain/transactions";

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

export type TransactionRepository = {
  list(params?: ListTransactionsParams, signal?: AbortSignal): Promise<TransactionWithRuntime[]>;
  create(input: Omit<AnyTransaction, "id">): Promise<TransactionWithRuntime>;
  update(
    id: string,
    patch: Partial<Omit<AnyTransaction, "id">>
  ): Promise<TransactionWithRuntime>;
  delete(id: string): Promise<void>;
  cancel(id: string, previousStatus: TransactionStatus): Promise<TransactionWithRuntime>;
  restore(id: string, status: TransactionStatus): Promise<TransactionWithRuntime>;
};

