import { AnyTransaction } from "../types";

export function currencyBRL(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

export function calcBalance(list: AnyTransaction[]): number {
    return list.reduce((acc, t) => {
        const sign = t.type === "withdraw" || t.type === "payment" || t.type === "pix" ? -1 : 1;
        return acc + sign * t.amount;
    }, 0);
}
