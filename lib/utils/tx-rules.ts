import { AnyTransaction } from "../types";

export function canEditTransaction(t: AnyTransaction, now = new Date()) {
    if (t.status === "scheduled") return true;
    if (t.status === "processing") return true; // janela de ajuste
    return false; // processed/cancelled/failed não editam
}

export function canDeleteTransaction(t: AnyTransaction) {
    if (t.status === "scheduled") return true;
    if (t.status === "processing") return true; // pode cancelar antes de liquidar
    return t.status === "cancelled" || t.status === "failed"; // limpeza
}
