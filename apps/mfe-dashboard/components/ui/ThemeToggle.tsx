"use client";

import { useTheme } from "@/theme/ThemeProvider";

export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full border border-surface-100 bg-surface-50 px-3 py-2"
            title={isDark ? "Mudar para claro" : "Mudar para escuro"}
        >
            <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
            <span className="text-[color:var(--color-fg)]/70">{isDark ? "Light" : "Dark"}</span>
        </button>
    );
}
