/** "2025-11-01T..." -> "2025-11-01" */
export function isoYmdFromAny(input: string): string | null {
    const s = String(input);
    const ymd = s.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
}

/** "yyyy-mm-dd" -> "dd/mm/yyyy" */
export function formatBrFromYmd(ymd: string): string {
    const [y, m, d] = ymd.split("-");
    return `${d}/${m}/${y}`;
}

/** Format any ISO-ish string into "dd/mm/yyyy" using your existing rules */
export function formatDateBRFromAny(input: string): string {
    const ymd = isoYmdFromAny(input);
    if (ymd) return formatBrFromYmd(ymd);
    return new Date(String(input)).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Start-of-day timestamp (UTC-ish) matching your current behavior */
export function dayStartTsUTCFromAny(input: string): number {
    const ymd = isoYmdFromAny(input);
    if (ymd) {
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(y, m - 1, d).getTime();
    }
    const d = new Date(new Date(String(input)).toLocaleString("en-US", { timeZone: "UTC" }));
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
