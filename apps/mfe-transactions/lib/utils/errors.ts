export function getErrorMessage(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
        const anyErr = err as any;
        if (typeof anyErr.message === "string") return anyErr.message;
        try { return JSON.stringify(anyErr); } catch { }
    }
    return fallback;
}