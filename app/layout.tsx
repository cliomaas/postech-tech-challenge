import "./globals.css";
import type { Metadata } from "next/types";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ByteBank — Tech Challenge",
  description: "Gerenciador financeiro (mock) — Next.js + Tailwind",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-white/10">
          <div className="container flex items-center justify-between h-14">
            <a href="/" className="font-semibold">💸 ByteBank</a>
            <nav className="flex items-center gap-4 text-sm">
              <a className="hover:underline" href="/">Home</a>
              <a className="hover:underline" href="/transactions">Transações</a>
              <a className="hover:underline" href="https://www.figma.com/design/ns5TC3X5Xr8V7I3LYKg9KA/Projeto-Financeiro?node-id=503-4264&t=gZy56WDAUfXtS23Y-1" target="_blank">Figma</a>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-10 text-center text-white/50 text-sm">Tech Challenge — Fase 1</footer>
      </body>
    </html>
  );
}
