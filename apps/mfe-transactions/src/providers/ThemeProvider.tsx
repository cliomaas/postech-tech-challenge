"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

const KEY = "app-theme";
const getSystem = (): Theme =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const saved = (localStorage.getItem(KEY) as Theme | null) ?? getSystem();
        setTheme(saved);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("dark", theme === "dark");
        localStorage.setItem(KEY, theme);
    }, [theme]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const saved = localStorage.getItem(KEY);
            if (!saved) setTheme(mq.matches ? "dark" : "light");
        };
        mq.addEventListener?.("change", handler);
        return () => mq.removeEventListener?.("change", handler);
    }, []);

    const api = useMemo<Ctx>(() => ({
        theme,
        setTheme,
        toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }), [theme]);

    return <ThemeCtx.Provider value={api}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => {
    const ctx = useContext(ThemeCtx);
    if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
    return ctx;
};
