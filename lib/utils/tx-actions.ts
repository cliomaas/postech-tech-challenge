import type { AnyTransaction } from "@/lib/types";

type ActionState = {
    editDisabled: boolean;
    deleteDisabled: boolean;
    editReason?: string;
    deleteReason?: string;
};

export function getTxActionState(t: AnyTransaction & { processingUntil?: string }): ActionState {
    if (t.status === "scheduled" || t.status === "processing") {
        return { editDisabled: false, deleteDisabled: false };
    }
    if (t.status === "processed") {
        const reason = "Transação já efetivada.";
        return { editDisabled: true, deleteDisabled: true, editReason: reason, deleteReason: reason };
    }
    if (t.status === "cancelled" || t.status === "failed") {
        return { editDisabled: true, deleteDisabled: false, editReason: "Inválida para edição.", deleteReason: "Remover do histórico." };
    }
    return { editDisabled: true, deleteDisabled: true };
}
