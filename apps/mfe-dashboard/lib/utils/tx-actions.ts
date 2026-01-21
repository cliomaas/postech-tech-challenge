import type { AnyTransaction } from "@/lib/types";

type ActionState = {
    editDisabled: boolean;
    deleteDisabled: boolean;
    editReason?: string;
    deleteReason?: string;
};

export function getTxActionState(t: AnyTransaction & { processingUntil?: string }): ActionState {
    if (t.status === "SCHEDULED" || t.status === "PROCESSING") {
        return { editDisabled: false, deleteDisabled: false };
    }
    if (t.status === "PROCESSED") {
        const reason = "Transação já efetivada.";
        return { editDisabled: true, deleteDisabled: true, editReason: reason, deleteReason: reason };
    }
    if (t.status === "CANCELLED" || t.status === "FAILED") {
        return { editDisabled: true, deleteDisabled: false, editReason: "Inválida para edição.", deleteReason: "Remover do histórico." };
    }
    return { editDisabled: true, deleteDisabled: true };
}
