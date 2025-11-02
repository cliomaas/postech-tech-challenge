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