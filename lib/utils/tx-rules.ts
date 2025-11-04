import { AnyTransaction } from "../types";

export function canEditTransaction(t: AnyTransaction, now = new Date()) {
    if (t.status === "scheduled") return true;
    if (t.status === "processing") return true;
    return false
}

export function canDeleteTransaction(t: AnyTransaction) {
    if (t.status === "scheduled") return true;
    if (t.status === "processing") return true;
    return t.status === "cancelled" || t.status === "failed";
}
