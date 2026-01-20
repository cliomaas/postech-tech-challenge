export const toCents = (valueInReais: number) => Math.round(valueInReais * 100);

export const fromCents = (valueInCents: number) => valueInCents / 100;

export const formatBRL = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);

const compactNumber = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

export const formatBRLCompact = (value: number) => {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (abs >= 1_000_000) {
        return `${sign}R$ ${compactNumber.format(abs / 1_000_000)}M`;
    }
    if (abs >= 1_000) {
        return `${sign}R$ ${compactNumber.format(abs / 1_000)}k`;
    }

    return formatBRL(value);
};
