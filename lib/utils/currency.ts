import { AnyTransaction } from "../types";

export function currencyBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function calcBalance(list: AnyTransaction[]): number {
    return list
        .filter(l => l.status !== "CANCELLED")
        .reduce((acc, t) => {
            if (t.status !== "PROCESSED") return acc;
            const sign = ["withdraw", "payment", "pix"].includes(t.type) ? -1 : 1;
            return acc + sign * t.amount;
        }, 0);
}

