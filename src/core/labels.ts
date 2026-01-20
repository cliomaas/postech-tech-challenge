import type { TransactionType, TransactionStatus, TransactionCategory } from "@/lib/types";

export const txLabel = {
    type: {
        deposit: "Depósito",
        transfer: "Transferência",
        payment: "Pagamento",
        withdraw: "Saque",
        pix: "Pix",
    } satisfies Record<TransactionType, string>,

    status: {
        SCHEDULED: "Agendado",
        PROCESSING: "Em processamento",
        PROCESSED: "Finalizado",
        CANCELLED: "Cancelado",
        FAILED: "Falha",
    } satisfies Partial<Record<TransactionStatus, string>>,

    category: {
        ALIMENTACAO: "Alimentação",
        MORADIA: "Moradia",
        LAZER: "Lazer",
        TRANSPORTE: "Transporte",
        OUTROS: "Outros",
        INCOME: "Entrada",
    } satisfies Record<TransactionCategory, string>,

} as const;
