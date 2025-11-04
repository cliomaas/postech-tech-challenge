"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Button from "@/components/ds/Button";

export default function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    // base styles
    const headerClass = clsx(
        "sticky top-0 z-30 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60",
        isHome
            ? "bg-white/70 dark:bg-neutral-900/60 border-black/5 dark:border-white/10"
            : "bg-white dark:bg-neutral-900 border-black/5 dark:border-white/10"
    );

    return (
        <header className={headerClass}>
            <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                <Link href={isHome ? "/" : "/dashboard"} className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">
                        B
                    </span>
                    <span className="font-semibold tracking-tight">Bytebank</span>
                </Link>

                {isHome ? (
                    <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700 dark:text-gray-200">
                        <a href="#sobre" className="hover:text-brand-600">Sobre</a>
                        <a href="#servicos" className="hover:text-brand-600">Serviços</a>
                    </nav>
                ) : (
                    <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700 dark:text-gray-200">
                        <Link href="/dashboard" className={navLink(pathname === "/dashboard")}>Visão geral</Link>
                        <Link href="/transactions" className={navLink(pathname?.startsWith("/transactions"))}>Transações</Link>
                        <Link href="/" className={navLink(pathname?.startsWith("/cards"))}>Cartões</Link>
                    </nav>
                )}

                <div className="flex items-center gap-2">
                    {isHome ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="hidden sm:inline-flex">Já tenho conta</Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button>Abra sua conta</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/">
                                <Button variant="ghost">Configurações</Button>
                            </Link>
                            <Button variant="danger">Sair</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

function navLink(active?: boolean) {
    return clsx(
        "hover:text-brand-600 transition-colors",
        active && "text-brand-700 dark:text-brand-300"
    );
}
