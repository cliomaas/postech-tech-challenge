"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Variant = "success" | "error" | "info" | "warning";

export type SnackInput = {
    message: string;
    variant?: Variant;
    duration?: number;      // ms
    actionLabel?: string;
    onAction?: () => void;
};

type Snack = SnackInput & { id: string; createdAt: number; };

type Ctx = {
    show: (s: SnackInput) => string;
    success: (m: string, opts?: Omit<SnackInput, "message" | "variant">) => string;
    error: (m: string, opts?: Omit<SnackInput, "message" | "variant">) => string;
    info: (m: string, opts?: Omit<SnackInput, "message" | "variant">) => string;
    warning: (m: string, opts?: Omit<SnackInput, "message" | "variant">) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
};

const SnackbarContext = createContext<Ctx | null>(null);
export const useSnackbar = () => {
    const ctx = useContext(SnackbarContext);
    if (!ctx) throw new Error("useSnackbar must be used inside <SnackbarProvider />");
    return ctx;
};

const vStyles: Record<Variant, string> = {
    success: "bg-success text-on-success",
    error: "bg-error text-on-error",
    info: "bg-info text-on-info",
    warning: "bg-warning text-on-warning",
};

const vRing: Record<Variant, string> = {
    success: "ring-success",
    error: "ring-error",
    info: "ring-info",
    warning: "ring-warning",
};

function SnackCard({
    snack,
    onClose,
    onAction,
}: {
    snack: Snack;
    onClose: () => void;
    onAction?: () => void;
}) {
    const [leaving, setLeaving] = useState(false);
    const [hover, setHover] = useState(false);
    const remaining = useRef(snack.duration ?? 4200);
    const started = useRef<number | null>(null);
    const t = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clear = () => { if (t.current) { clearTimeout(t.current); t.current = null; } };

    useEffect(() => {
        const tick = () => onClose();
        started.current = Date.now();
        t.current = setTimeout(tick, remaining.current);
        return clear;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pause = () => {
        if (!hover) return;
        if (started.current) {
            remaining.current -= Date.now() - started.current;
            started.current = null;
            clear();
        }
    };

    const resume = () => {
        if (started.current) return;
        started.current = Date.now();
        t.current = setTimeout(() => onClose(), remaining.current);
    };

    useEffect(() => {
        hover ? pause() : resume();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hover]);

    const base = vStyles[snack.variant ?? "info"];
    const ring = vRing[snack.variant ?? "info"];

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className={[
                "pointer-events-auto w-full sm:w-[380px] max-w-[92vw]",
                "rounded-2xl shadow-lg ring-1", ring,
                "px-4 py-3 flex items-start gap-3",
                "transition-all duration-200",
                leaving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
                base,
            ].join(" ")}
            role="status"
            aria-live="polite"
        >
            <div className="flex-1 text-sm leading-5">{snack.message}</div>
            {snack.actionLabel && (
                <button
                    className="shrink-0 rounded-md px-2 py-1 text-sm/5 ring-1 ring-white/20 hover:bg-white/10"
                    onClick={() => { onAction?.(); setLeaving(true); setTimeout(onClose, 160); }}
                >
                    {snack.actionLabel}
                </button>
            )}
            <button
                className="shrink-0 rounded-md px-2 py-1 text-sm/5 ring-1 ring-white/20 hover:bg-white/10"
                aria-label="Fechar"
                onClick={() => { setLeaving(true); setTimeout(onClose, 160); }}
            >
                ×
            </button>
        </div>
    );
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
    const [snacks, setSnacks] = useState<Snack[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const dismiss = useCallback((id: string) => {
        setSnacks((s) => s.filter((n) => n.id !== id));
    }, []);

    const dismissAll = useCallback(() => setSnacks([]), []);

    const show = useCallback((s: SnackInput) => {
        const id = Math.random().toString(36).slice(2, 9);
        setSnacks((prev) => [
            ...prev,
            {
                id,
                message: s.message,
                variant: s.variant ?? "info",
                duration: s.duration ?? 4200,
                actionLabel: s.actionLabel,
                onAction: s.onAction,
                createdAt: Date.now(),
            },
        ].slice(-4)); // limita a 4
        return id;
    }, []);

    const api = useMemo<Ctx>(() => ({
        show,
        dismiss,
        dismissAll,
        success: (m, opts) => show({ message: m, variant: "success", ...opts }),
        error: (m, opts) => show({ message: m, variant: "error", ...opts }),
        info: (m, opts) => show({ message: m, variant: "info", ...opts }),
        warning: (m, opts) => show({ message: m, variant: "warning", ...opts }),
    }), [show, dismiss]);

    return (
        <SnackbarContext.Provider value={api}>
            {children}
            {mounted && createPortal(
                <div className="pointer-events-none fixed inset-x-0 bottom-4 sm:bottom-6 z-[100] flex flex-col items-center gap-2 sm:items-end sm:right-6">
                    {snacks.map((snack) => (
                        <SnackCard
                            key={snack.id}
                            snack={snack}
                            onAction={snack.onAction}
                            onClose={() => api.dismiss(snack.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </SnackbarContext.Provider>
    );
}
