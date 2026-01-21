import {
    AnyTransaction,
    PixTransaction,
    Transaction,
    TransactionType,
    PixType,
} from "../types";
import { toISOFromDatetimeLocal } from "./date";
import { attachmentSchema, transactionCategorySchema } from "@/src/core/transaction";
import { z } from "zod";

type NonPixPayload = Omit<Transaction, "id" | "status"> & {
    type: Exclude<TransactionType, "pix">;
};

type PixCreatePayload = {
    type: "pix";
    description: string;
    amount: number;
    date: string;
    category: z.infer<typeof transactionCategorySchema>;
    pixType: PixType;      // "normal" | "scheduled"
    scheduledFor?: string; // ISO
};

const PROCESSING_MS = 2 * 60 * 1000;

export type RuntimeFlags = {
    processingUntil?: string; // ISO when processed
};

export type FormPayload = (NonPixPayload | PixCreatePayload) & {
    attachments?: z.infer<typeof attachmentSchema>[];
};

export function buildFormPayload(
    base: {
        description: string;
        amount: number;
        date: string;
        category?: z.infer<typeof transactionCategorySchema>;
        attachments?: z.infer<typeof attachmentSchema>[];
    },
    type: TransactionType,
    pix: { pixType: "normal" | "scheduled"; scheduledFor?: string }
): FormPayload {
    const category = base.category ?? "OUTROS";
    const attachments = base.attachments?.length ? base.attachments : undefined;
    if (type !== "pix") {
        return {
            type,
            ...base,
            category,
            ...(attachments ? { attachments } : {}),
        } as NonPixPayload;
    }

    return pix.pixType === "scheduled"
        ? {
            type: "pix",
            ...base,
            category,
            pixType: "scheduled",
            scheduledFor: toISOFromDatetimeLocal(pix.scheduledFor || ""),
            ...(attachments ? { attachments } : {}),
        }
        : { type: "pix", ...base, category, pixType: "normal", ...(attachments ? { attachments } : {}) };
}

export function finalizeFromForm(
    p: FormPayload,
    now: Date = new Date()
): (Omit<AnyTransaction, "id"> & RuntimeFlags) {
    const nowISO = now.toISOString();
    console.log('datas', 'now', now, 'nowISO', nowISO, 'p', p)
    const isFuture = new Date(p.date) > now;
    const attachments = p.attachments?.length ? { attachments: p.attachments } : {};

    if (p.type === "pix") {
        if (p.pixType === "scheduled") {
            const tx: Omit<PixTransaction, "id"> & RuntimeFlags = {
                type: "pix",
                description: p.description,
                amount: p.amount,
                date: p.date,
                pixType: "scheduled",
                status: "SCHEDULED",
                ...(p.scheduledFor ? { scheduledFor: p.scheduledFor } : {}),
                category: p.category,
                ...attachments,
            };
            return tx;
        }

        const until = new Date(now.getTime() + PROCESSING_MS).toISOString();
        const tx: Omit<PixTransaction, "id"> & RuntimeFlags = {
            type: "pix",
            description: p.description,
            amount: p.amount,
            date: p.date || nowISO,
            pixType: "normal",
            status: "PROCESSING",
            processingUntil: until,
            category: p.category,
            ...attachments,
        };
        return tx;
    }

    if (isFuture) {
        const tx: Omit<Transaction, "id"> & RuntimeFlags = {
            type: p.type,
            description: p.description,
            amount: p.amount,
            date: p.date,
            status: "SCHEDULED",
            category: p.category,
            ...attachments,
        };
        return tx;
    }

    const until = new Date(now.getTime() + PROCESSING_MS).toISOString();
    const tx: Omit<Transaction, "id"> & RuntimeFlags = {
        type: p.type,
        description: p.description,
        amount: p.amount,
        date: p.date,
        status: "PROCESSING",
        processingUntil: until,
        category: p.category,
        ...attachments,
    };
    return tx;
}
