import { useMemo, useState, useEffect } from "react";
import Input from "@/components/ds/Input";
import Button from "@/components/ds/Button";
import { TransactionType, TransactionStatus, AnyTransaction, TransactionCategory } from "@/lib/types";
import { txLabel } from "@/src/core/labels";



export type Filters = {
    status: "ALL" | TransactionStatus;
    type: "ALL" | TransactionType;
    category: "ALL" | TransactionCategory;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
};

export const DEFAULT_FILTERS: Filters = {
    status: "ALL",
    type: "ALL",
    category: "ALL",
    dateFrom: "",
    dateTo: "",
    minAmount: "",
    maxAmount: "",
};

function countActiveFilters(f: Filters) {
    let n = 0;
    if (f.status !== "ALL") n++;
    if (f.type !== "ALL") n++;
    if (f.category !== "ALL") n++;
    if (f.dateFrom) n++;
    if (f.dateTo) n++;
    if (f.minAmount) n++;
    if (f.maxAmount) n++;
    return n;
}

function toNumberOrNull(v: string) {
    const normalized = v.replace(",", ".").trim();
    if (!normalized) return null;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
}

function inDateRange(dateISO: string, from?: string, to?: string) {
    if (from && dateISO < from) return false;
    if (to && dateISO > to) return false;
    return true;
}

export function TxFilters({
    transactions,
    onOpenCreate,
    onRefresh,
    onFiltersChange,
    children,
}: {
    transactions: AnyTransaction[];
    onOpenCreate: () => void;
    onRefresh?: () => void;
    onFiltersChange?: (state: { query: string; filters: Filters }) => void;
    children: (filtered: AnyTransaction[]) => React.ReactNode;
}) {
    const [query, setQuery] = useState("");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);


    const activeCount = countActiveFilters(filters);

    useEffect(() => {
        console.log(transactions);
        onFiltersChange?.({ query, filters });
    }, [query, filters, onFiltersChange]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const min = toNumberOrNull(filters.minAmount);
        const max = toNumberOrNull(filters.maxAmount);

        return transactions.filter((t) => {
            const matchesQuery =
                !q ||
                (t.description?.toLowerCase().includes(q) ?? false) ||
                txLabel.type[t.type as keyof typeof txLabel.type].toLowerCase().includes(q);

            if (!matchesQuery) return false;
            if (filters.status !== "ALL" && t.status !== filters.status) return false;
            if (filters.type !== "ALL" && t.type !== filters.type) return false;
            if (filters.category !== "ALL" && t.category !== filters.category) return false;
            if (!inDateRange(t.date, filters.dateFrom || undefined, filters.dateTo || undefined))
                return false;
            if (min !== null && t.amount < min) return false;
            if (max !== null && t.amount > max) return false;

            return true;
        });
    }, [transactions, query, filters]);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <Input
                        placeholder="Buscar por descrição ou tipo"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Buscar transações"
                    />
                </div>

                <Button variant="ghost" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
                    Filtros
                    {activeCount > 0 && (
                        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs text-white">
                            {activeCount}
                        </span>
                    )}
                </Button>
                <Button onClick={onOpenCreate}>Nova</Button>

                {onRefresh && (
                    <Button variant="ghost" onClick={onRefresh} aria-label="Atualizar" title="Atualizar">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                            autorenew
                        </span>
                    </Button>
                )}
            </div>

            {filtersOpen && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                        <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-sm text-white/70">Data (de)</label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => setFilters((s) => ({ ...s, dateFrom: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-sm text-white/70">Data (até)</label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => setFilters((s) => ({ ...s, dateTo: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm text-white/70">Status</label>
                            <select
                                className="h-10 rounded-md bg-black/20 px-3 outline-none"
                                value={filters.status}
                                onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value as Filters["status"] }))}
                            >
                                <option value="ALL">Todos</option>
                                <option value="PROCESSED">Finalizado</option>
                                <option value="SCHEDULED">Agendado</option>
                                <option value="CANCELLED">Cancelado</option>
                                <option value="PROCESSING">Em Processamento</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm text-white/70">Tipo</label>
                            <select
                                className="h-10 rounded-md bg-black/20 px-3 outline-none"
                                value={filters.type}
                                onChange={(e) => setFilters((s) => ({ ...s, type: e.target.value as Filters["type"] }))}
                            >
                                <option value="ALL">Todos</option>
                                <option value="deposit">Depósito</option>
                                <option value="withdraw">Saque</option>
                                <option value="pix">Pix</option>
                                <option value="transfer">Transferência</option>
                                <option value="payment">Pagamento</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm text-white/70">Categoria</label>
                            <select
                                className="h-10 rounded-md bg-black/20 px-3 outline-none"
                                value={filters.category}
                                onChange={(e) =>
                                    setFilters((s) => ({
                                        ...s,
                                        category: e.target.value as Filters["category"],
                                    }))
                                }
                            >
                                <option value="ALL">Todas</option>
                                <option value="ALIMENTACAO">Alimentação</option>
                                <option value="MORADIA">Moradia</option>
                                <option value="LAZER">Lazer</option>
                                <option value="TRANSPORTE">Transporte</option>
                                <option value="OUTROS">Outros</option>
                                <option value="INCOME">Receita</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-sm text-white/70">Valor (mín.)</label>
                            <Input
                                inputMode="decimal"
                                value={filters.minAmount}
                                onChange={(e) => setFilters((s) => ({ ...s, minAmount: e.target.value }))}
                            />
                        </div>

                        <div className="flex flex-col gap-1 md:col-span-3">
                            <label className="text-sm text-white/70">Valor (máx.)</label>
                            <Input
                                inputMode="decimal"
                                value={filters.maxAmount}
                                onChange={(e) => setFilters((s) => ({ ...s, maxAmount: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setFilters(DEFAULT_FILTERS);
                                setFiltersOpen(false);
                            }}
                        >
                            Limpar
                        </Button>
                    </div>
                </div>
            )}

            {children(filtered)}
        </div>
    );
}
