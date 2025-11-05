/**
 * Convert "yyyy-mm-dd" (input[type="date"]) to ISO string.
 * Example: "2025-11-01" -> "2025-11-01T03:00:00.000Z" (depending on the local timezone)
 */
export function toISODateOnly(date: string): string {
    return new Date(date).toISOString();
}

/**
 * Convert "yyyy-mm-ddTHH:mm" (input[type="datetime-local"]) to ISO string.
 * Return empty string if the value is falsy.
 */
export function toISOFromDatetimeLocal(datetime: string): string {
    return datetime ? new Date(datetime).toISOString() : "";
}

/**
 * 
 * Returns today date in ISO
 */
export function getTodayISO(): string {
    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yyyy = local.getFullYear();
    const mm = String(local.getMonth() + 1).padStart(2, "0");
    const dd = String(local.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}


export function txRawDate(t: { date: string; status: string; scheduledFor?: string | null }) {
    return t.status === "scheduled" && t.scheduledFor ? t.scheduledFor : t.date;
}

export function brDateFromAny(input: string): string {
    const s = String(input);
    const ymd = s.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [y, m, d] = ymd.split("-");
        return `${d}/${m}/${y}`;
    }
    return new Date(s).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function dayStartTsFromAny(input: string): number {
    const s = String(input);
    const ymd = s.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        const [y, m, d] = ymd.split("-").map(Number);
        return new Date(y, m - 1, d).getTime();
    }
    const d = new Date(new Date(s).toLocaleString("en-US", { timeZone: "UTC" }));
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
