"use client";

import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ds/Button";
import { clsx } from "clsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* HERO */}
      <section className="relative">
        <div
          aria-hidden
          className={clsx(
            "pointer-events-none absolute inset-0 -z-10",
            "bg-[radial-gradient(60%_60%_at_70%_30%,theme(colors.brand.200/30),transparent_60%)]"
          )}
        />
        <div className="mx-auto max-w-6xl px-4 pt-14 md:pt-24 grid md:grid-cols-2 items-center gap-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-fg/70">
              100% digital • Sem tarifas escondidas
            </p>

            <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
              Abra sua conta digital{" "}
              <span className="text-[var(--color-brand-600)]">gratuita</span>
            </h1>

            <p className="mt-4 text-base max-w-[52ch] text-fg/80">
              Mais liberdade para controlar sua vida financeira com ferramentas
              simples, seguras e pensadas para o dia a dia.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/dashboard">
                <Button>Abra minha conta</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost">Já tenho conta</Button>
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-3 text-xs text-fg/60">
              <span className="inline-flex size-5 items-center justify-center rounded-full ring-1 ring-brand">
                ✓
              </span>
              Sem mensalidade • Pix • Cartão • Segurança de dispositivos
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[var(--radius-xl2)] bg-brand opacity-10 blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden flex justify-center">
              <Image
                src="/HeroImage.svg"
                alt="Cliente Bytebank feliz usando o app"
                width={300}
                height={700}
                className="h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="servicos" className="py-12 md:py-16 border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold">Vantagens do nosso banco</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature
              title="Conta e cartão gratuitos"
              desc="Sem custo fixo e sem tarifa de manutenção."
              icon={<GiftIcon />}
            />
            <Feature
              title="Saques sem custo"
              desc="Até 4x/mês na rede Banco 24h."
              icon={<MoneyIcon />}
            />
            <Feature
              title="Programa de pontos"
              desc="Acumule pontos com compras no crédito."
              icon={<StarIcon />}
            />
            <Feature
              title="Seguro de dispositivos"
              desc="Proteção para celular e notebook por valor simbólico."
              icon={<DeviceIcon />}
            />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="max-w-[60ch]">
            <h2 className="text-2xl font-semibold">Transparência e simplicidade</h2>

            <p className="mt-3 text-fg/80 leading-relaxed">
              O Bytebank nasceu para tirar a dor de cabeça do dinheiro. Sem letras miúdas,
              sem fricção e com uma experiência rápida — do onboarding ao dia a dia.
            </p>

            <ul className="mt-4 list-disc pl-5 space-y-1 marker:text-[var(--color-brand-600)]">
              <li>Onboarding em minutos</li>
              <li>Pix, TED, boleto e cartões</li>
              <li>Relatórios claros e acessíveis</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-xl2)] border border-[var(--color-border)] p-6 bg-surface">
            <h3 className="font-semibold">Comece agora</h3>
            <p className="mt-2 text-sm text-fg/80">
              Crie sua conta grátis e importe suas transações mockadas para testar o app.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/dashboard">
                <Button>Quero abrir minha conta</Button>
              </Link>
              <a
                href="https://github.com/cliomaas/postech-tech-challenge-fase-1"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="ghost">Ver repositório</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)] py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-6 items-center justify-center rounded-lg bg-brand text-on-brand font-bold">
              B
            </span>
            <span className="font-semibold tracking-tight">Bytebank</span>
          </div>
          <div className="text-sm text-fg/80">
            <p>Contato</p>
            <p>0800 004 250 08 • meajuda@bytebank.com.br</p>
          </div>
          <div className="text-sm text-fg/80">
            <p>Desenvolvido por Clio :) • Pós FIAP</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-xl2)] border border-[var(--color-border)] p-5 bg-surface">
      <div className="size-9 rounded-xl bg-brand/10 text-[var(--color-brand-700)] flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-fg/80">{desc}</p>
    </div>
  );
}

/* Ícones inline */
function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7m16 0H4m16-4H4m8 0V4m0 0a3 3 0 0 1 6 0v4M12 4a3 3 0 0 0-6 0v4" />
    </svg>
  );
}
function MoneyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 12h10M12 9v6" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3.1 1.1-6.5L2.6 9.8l6.5-.9L12 3z" />
    </svg>
  );
}
function DeviceIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="14" height="16" rx="2" />
      <path d="M19 7h2v10h-2M7 20h6" />
    </svg>
  );
}
