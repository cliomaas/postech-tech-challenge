import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";
import type { Metadata } from "next/types";
import { ReactNode } from "react";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { SnackbarProvider } from "@/components/ds/SnackbarProvider";
import Header from "@/components/header";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "ByteBank — Tech Challenge",
  description: "Gerenciador financeiro (mock) — Next.js + Tailwind",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=autorenew" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=attach_file" />
        {/* dark mode script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function () {
        try {
          var key="app-theme";
          var saved=localStorage.getItem(key);
          var sysDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;
          var wantDark = saved ? saved==="dark" : sysDark;
          if (wantDark) document.documentElement.classList.add("dark");
        } catch {}
      })();
    `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SnackbarProvider>
              <Header />
              <main className="container py-6">{children}</main>
              <footer className="container py-10 text-center text-muted text-sm">Tech Challenge — Fase 1</footer>
            </SnackbarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html >
  );
}
