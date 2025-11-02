import type { AnyTransaction } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function j<T>(res: Response): Promise<T> {
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

export async function listTransactions(opts?: {
    q?: string;
    type?: string;
    status?: string;
    _sort?: string;
    _order?: "asc" | "desc";
    _page?: number;
    _limit?: number;
}): Promise<AnyTransaction[]> {
    const p = new URLSearchParams();
    if (opts?.q) p.set("q", opts.q);
    if (opts?.type) p.set("type", opts.type);
    if (opts?.status) p.set("status", opts.status);
    if (opts?._sort) p.set("_sort", opts._sort);
    if (opts?._order) p.set("_order", opts._order);
    if (opts?._page) p.set("_page", String(opts._page));
    if (opts?._limit) p.set("_limit", String(opts._limit));
    const res = await fetch(`${BASE}/transactions?${p.toString()}`, { cache: "no-store" });
    return j<AnyTransaction[]>(res);
}

export async function getTransaction(id: string) {
    const res = await fetch(`${BASE}/transactions/${id}`, { cache: "no-store" });
    return j<AnyTransaction>(res);
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
