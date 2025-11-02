import { PixType, TransactionType, Transaction } from "../types";
import { toISOFromDatetimeLocal } from "./date";

type NonPixPayload = Omit<Transaction, "id" | "status"> & { type: Exclude<TransactionType, "pix"> };
type PixCreatePayload = {
    type: "pix";
    description: string;
    amount: number;
    date: string;
    pixType: PixType;
    scheduledFor?: string;
};
export type FormPayload = NonPixPayload | PixCreatePayload;

export function buildFormPayload(
    base: { description: string; amount: number; date: string },
    type: TransactionType,
    pix: { pixType: "normal" | "scheduled"; scheduledFor?: string }
): FormPayload {
    if (type !== "pix") return { type, ...base } as NonPixPayload;
    return pix.pixType === "scheduled"
        ? { type: "pix", ...base, pixType: "scheduled", scheduledFor: toISOFromDatetimeLocal(pix.scheduledFor || "") }
        : { type: "pix", ...base, pixType: "normal" };
}
