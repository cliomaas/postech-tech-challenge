import { AnyTransaction } from "../types";
import { dayStartTsFromAny, getTodayISO } from "./date";

export function canEditTransaction(t: AnyTransaction, now = new Date()) {
    if (t.status === "SCHEDULED") return true;
    if (t.status === "PROCESSING") return true;
    return false
}

export function canDeleteTransaction(t: AnyTransaction) {
    if (t.status === "SCHEDULED") return true;
    if (t.status === "PROCESSING") return true;
    return t.status === "CANCELLED" || t.status === "FAILED";
}


export function isExpiredScheduled(tx: any) {
    if (tx.status !== "SCHEDULED") return false;
    if (!tx.scheduledFor) return false;

    const todayStart = dayStartTsFromAny(getTodayISO());
    const scheduledStart = dayStartTsFromAny(tx.scheduledFor);

    return scheduledStart < todayStart;
}
