import type {
  AnyTransaction,
  ListTransactionsParams,
  TransactionStatus,
  TransactionWithRuntime,
} from "@/lib/domain/transactions";

export type TransactionRepository = {
  list(params?: ListTransactionsParams, signal?: AbortSignal): Promise<TransactionWithRuntime[]>;
  get(id: string): Promise<TransactionWithRuntime>;
  create(input: Omit<AnyTransaction, "id">): Promise<TransactionWithRuntime>;
  update(
    id: string,
    patch: Partial<Omit<AnyTransaction, "id">>
  ): Promise<TransactionWithRuntime>;
  delete(id: string): Promise<void>;
  cancel(id: string, previousStatus: TransactionStatus): Promise<TransactionWithRuntime>;
  restore(id: string, status: TransactionStatus): Promise<TransactionWithRuntime>;
};

