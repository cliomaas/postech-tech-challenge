// HTTP client for the external API (Render/json-server), not Next.js route handlers.
import type { AnyTransaction, TransactionStatus } from "@/lib/types";
import { getTodayISO, dayStartTsFromAny } from "@/lib/utils/date";
import { getApiBase } from "@/lib/env";

const BASE = getApiBase();

async function j<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

export async function listTransactions(opts?: {
    q?: string;
    type?: string;
    status?: string;
    category?: string;
    _sort?: string;
    _order?: "asc" | "desc";
    _page?: number;
    _limit?: number;
}, signal?: AbortSignal): Promise<AnyTransaction[]> {
    const p = new URLSearchParams();
    if (opts?.q) p.set("q", opts.q);
    if (opts?.type) p.set("type", opts.type);
    if (opts?.status) p.set("status", opts.status);
    if (opts?.category) p.set("category", opts.category);
    if (opts?._sort) p.set("_sort", opts._sort);
    if (opts?._order) p.set("_order", opts._order);
    if (opts?._limit) p.set("_limit", String(opts._limit));
    if (opts?._page && opts?._limit) {
        const start = (opts._page - 1) * opts._limit;
        p.set("_start", String(start));
    } else if (opts?._page) {
        p.set("_page", String(opts._page));
    }
    const res = await fetch(`${BASE}/transactions?${p.toString()}`, {
        cache: "no-store",
        signal,
    });
    const data = await j<AnyTransaction[]>(res);

    const todayStart = dayStartTsFromAny(getTodayISO());

    return data.map((tx) => {
        const txWithCategory = {
            ...tx,
            category: tx.type === "withdraw" || tx.type === "payment" || tx.type === "pix" ? (tx.category ?? "OUTROS") : "INCOME",
        };

        let normalizedTx = txWithCategory;
        if (txWithCategory.status && typeof txWithCategory.status === 'string') {
            const normalizedStatus = txWithCategory.status.toUpperCase() as TransactionStatus;
            normalizedTx = { ...txWithCategory, status: normalizedStatus };
        }

        if (
            normalizedTx.status === "SCHEDULED" &&
            "scheduledFor" in normalizedTx &&
            normalizedTx.scheduledFor &&
            dayStartTsFromAny(normalizedTx.scheduledFor) < todayStart
        ) {
            return {
                ...normalizedTx,
                status: "CANCELLED",
                previousStatus: normalizedTx.status,
                locked: true, // restored blocked
            };
        }

        return normalizedTx;
    });
}

export async function getTransaction(id: string) {
    const res = await fetch(`${BASE}/transactions/${id}`, { cache: "no-store" });
    const tx = await j<AnyTransaction>(res);
    return {
        ...tx,
        category: tx.category ?? "OUTROS",
    };
}

export async function createTransaction(input: Omit<AnyTransaction, "id">) {
    const res = await fetch(`${BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });
    return j<AnyTransaction>(res);
}

export async function updateTransaction(id: string, patch: Partial<Omit<AnyTransaction, "id">>) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
    });
    return j<AnyTransaction>(res);
}

export async function deleteTransaction(id: string) {
    const res = await fetch(`${BASE}/transactions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export async function cancelTransaction(id: string, previousStatus: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", previousStatus }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

export async function restoreTransaction(id: string, status: TransactionStatus) {
    const res = await fetch(`${BASE}/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, previousStatus: undefined }),
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}
