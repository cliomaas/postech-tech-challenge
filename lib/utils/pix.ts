// lib/utils/pix.ts
import type { AnyTransaction, PixTransaction } from "@/lib/types";

export function isPixTransaction(t: AnyTransaction): t is PixTransaction {
    return t.type === "pix";
}

export function canEditTransaction(t: AnyTransaction) {
    if (!isPixTransaction(t)) return true;
    return t.pixType === "scheduled";
}
