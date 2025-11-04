import {
    AnyTransaction,
    PixTransaction,
    Transaction,
    TransactionType,
    PixType,
} from "../types";
import { toISOFromDatetimeLocal } from "./date";

type NonPixPayload = Omit<Transaction, "id" | "status"> & {
    type: Exclude<TransactionType, "pix">;
};

type PixCreatePayload = {
    type: "pix";
    description: string;
    amount: number;
    date: string;
    pixType: PixType;      // "normal" | "scheduled"
    scheduledFor?: string; // ISO
};

const PROCESSING_MS = 2 * 60 * 1000;

export type RuntimeFlags = {
    processingUntil?: string; // ISO quando deve virar processed
};

export type FormPayload = NonPixPayload | PixCreatePayload;

export function buildFormPayload(
    base: { description: string; amount: number; date: string },
    type: TransactionType,
    pix: { pixType: "normal" | "scheduled"; scheduledFor?: string }
): FormPayload {
    if (type !== "pix") return { type, ...base } as NonPixPayload;

    return pix.pixType === "scheduled"
        ? {
            type: "pix",
            ...base,
            pixType: "scheduled",
            scheduledFor: toISOFromDatetimeLocal(pix.scheduledFor || ""),
        }
        : { type: "pix", ...base, pixType: "normal" };
}

export function finalizeFromForm(
    p: FormPayload,
    now: Date = new Date()
): (Omit<AnyTransaction, "id"> & RuntimeFlags) {
    const nowISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    const isFuture = new Date(p.date) > now;

    if (p.type === "pix") {
        if (p.pixType === "scheduled") {
            const tx: Omit<PixTransaction, "id"> & RuntimeFlags = {
                type: "pix",
                description: p.description,
                amount: p.amount,
                date: p.date,
                pixType: "scheduled",
                status: "scheduled",
                ...(p.scheduledFor ? { scheduledFor: p.scheduledFor } : {}),
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
            status: "processing",
            processingUntil: until,
        };
        return tx;
    }

    if (isFuture) {
        const tx: Omit<Transaction, "id"> & RuntimeFlags = {
            type: p.type,
            description: p.description,
            amount: p.amount,
            date: p.date,
            status: "scheduled",
        };
        return tx;
    }

    const until = new Date(now.getTime() + PROCESSING_MS).toISOString();
    const tx: Omit<Transaction, "id"> & RuntimeFlags = {
        type: p.type,
        description: p.description,
        amount: p.amount,
        date: p.date,
        status: "processing",
        processingUntil: until,
    };
    return tx;
}
