// components/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Button from "@/components/ds/Button";
import { ThemeToggle } from "./ui/ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import type { Route } from "next";
import type { UrlObject } from "url";

export default function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();

    const headerClass = clsx(
        "sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/60",
        isHome
            ? "bg-white/70 dark:bg-neutral-900/60 border-black/5 dark:border-white/10"
            : "bg-white dark:bg-neutral-900 border-black/5 dark:border-white/10"
    );

    return (
        <header className={headerClass}>
            <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                <Link href={isHome ? "/" : "/dashboard"} className="flex items-center gap-2">
                    <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">B</span>
                    <span className="font-semibold tracking-tight">Bytebank</span>
                </Link>

                {/* Desktop nav */}
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
                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {isHome ? (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost">Já tenho conta</Button>
                                </Link>
                                <Link href="/register">
                                    <Button>Abra sua conta</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                {session ? (
                                    <Button variant="danger" onClick={() => signOut({ callbackUrl: "/" })}>
                                        Sair
                                    </Button>
                                ) : (
                                    <Link href="/login">
                                        <Button variant="ghost">Entrar</Button>
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    <ThemeToggle />

                    {/* Mobile hamburger */}
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="md:hidden inline-flex items-center justify-center size-9 rounded-xl ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                        aria-label="Abrir menu"
                        aria-expanded={open}
                    >
                        <BurgerIcon />
                    </button>
                </div>
            </div>

            {/* Drawer mobile */}
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                        onClick={() => setOpen(false)}
                        aria-hidden
                    />
                    <aside
                        className="fixed right-0 top-0 z-50 h-full w-80 max-w-[85%] bg-white dark:bg-neutral-900 border-l border-black/10 dark:border-white/10 shadow-xl
                       animate-in slide-in-from-right duration-200"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="h-14 px-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand-500 text-white font-bold">B</span>
                                <span className="font-semibold tracking-tight">Menu</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center size-9 rounded-xl ring-1 ring-black/10 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                                aria-label="Fechar menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="px-2 py-2 bg-black/100">
                            {isHome ? (
                                <ul className="space-y-1">
                                    <LiLink href="#sobre" onClickClose={() => setOpen(false)}>Sobre</LiLink>
                                    <LiLink href="#servicos" onClickClose={() => setOpen(false)}>Serviços</LiLink>
                                    <hr className="my-2 border-black/10 dark:border-white/10" />
                                    <LiLink href="/login" onClickClose={() => setOpen(false)}>Entrar no app</LiLink>
                                    <LiLink href="/register" onClickClose={() => setOpen(false)}>Criar conta</LiLink>
                                </ul>
                            ) : (
                                <ul className="space-y-1">
                                    <LiLink href="/dashboard" active={pathname === "/dashboard"} onClickClose={() => setOpen(false)}>Visão geral</LiLink>
                                    <LiLink href="/transactions" active={pathname?.startsWith("/transactions")} onClickClose={() => setOpen(false)}>Transações</LiLink>
                                    <LiLink href="/" active={pathname?.startsWith("/cards")} onClickClose={() => setOpen(false)}>Cartões</LiLink>
                                    <hr className="my-2 border-black/10 dark:border-white/10" />
                                    {session ? (
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setOpen(false);
                                                    signOut({ callbackUrl: "/" });
                                                }}
                                                className="w-full text-left rounded-xl px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700"
                                            >
                                                Sair
                                            </button>
                                        </li>
                                    ) : (
                                        <LiLink href="/login" onClickClose={() => setOpen(false)}>Entrar</LiLink>
                                    )}
                                </ul>
                            )}
                        </nav>
                    </aside>
                </>
            )}
        </header>
    );
}

function LiLink({
    href,
    children,
    active,
    danger,
    onClickClose,
}: {
    href: Route | UrlObject | `#${string}`;
    children: React.ReactNode;
    active?: boolean;
    danger?: boolean;
    onClickClose?: () => void;
}) {
    const className = clsx(
        "block rounded-xl px-3 py-2 text-sm transition-colors",
        active && "bg-brand-500/10 text-brand-700 dark:text-brand-300",
        danger
            ? "text-white bg-red-600 hover:bg-red-700 dark:text-white"
            : "hover:bg-black/5 dark:hover:bg-white/5"
    );

    const isHash = typeof href === "string" && href.startsWith("#");

    return (
        <li>
            {isHash ? (
                <a href={href} onClick={onClickClose} className={className}>
                    {children}
                </a>
            ) : (
                <Link href={href as Route | UrlObject} onClick={onClickClose} className={className}>
                    {children}
                </Link>
            )}
        </li>
    );
}

function navLink(active?: boolean) {
    return clsx(
        "hover:text-brand-600 transition-colors",
        active && "text-brand-700 dark:text-brand-300"
    );
}

function BurgerIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
    );
}
