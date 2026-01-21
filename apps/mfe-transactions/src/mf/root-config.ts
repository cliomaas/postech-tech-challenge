"use client";

import { registerApplication, start } from "single-spa";

let registered = false;
let started = false;

type SingleSpaLifecycle = {
  bootstrap: (props?: unknown) => Promise<unknown>;
  mount: (props?: unknown) => Promise<unknown>;
  unmount: (props?: unknown) => Promise<unknown>;
};

const DEFAULT_DASHBOARD_URL = "http://localhost:9101/mfe-dashboard.umd.js";
const DEFAULT_TRANSACTIONS_URL = "http://localhost:9102/mfe-transactions.umd.js";

const dashboardUrl =
  process.env.NEXT_PUBLIC_MFE_DASHBOARD_URL ?? DEFAULT_DASHBOARD_URL;
const transactionsUrl =
  process.env.NEXT_PUBLIC_MFE_TRANSACTIONS_URL ?? DEFAULT_TRANSACTIONS_URL;

const registry = new Map<string, Promise<SingleSpaLifecycle>>();

function isLifecycle(value: unknown): value is SingleSpaLifecycle {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.bootstrap === "function" &&
    typeof candidate.mount === "function" &&
    typeof candidate.unmount === "function"
  );
}

function loadRemote(name: string, url: string, retries = 8, delayMs = 500) {
  const existingPromise = registry.get(name);
  if (existingPromise) return existingPromise;
  const promise = new Promise<SingleSpaLifecycle>((resolve, reject) => {
    if (typeof window === "undefined") return;

    const attempt = (tryIndex: number) => {
      const existing = (window as any)[name];
      const existingDefault = (window as any)[name]?.default;
      const ready = existing ?? existingDefault;
      if (isLifecycle(ready)) {
        resolve(ready);
        return;
      }

      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.dataset.mfe = name;
      script.onload = () => {
        const app = (window as any)[name] ?? (window as any)[name]?.default;
        if (!isLifecycle(app)) {
          reject(new Error(`MFE ${name} missing lifecycle exports`));
          return;
        }
        resolve(app);
      };
      script.onerror = () => {
        script.remove();
        if (tryIndex < retries) {
          setTimeout(() => attempt(tryIndex + 1), delayMs);
          return;
        }
        reject(new Error(`Failed to load ${url}`));
      };
      document.head.appendChild(script);
    };

    attempt(0);
  });
  registry.set(name, promise);
  return promise;
}

function registerApps() {
  if (registered) return;
  registerApplication({
    name: "mfe-dashboard",
    app: () => loadRemote("mfeDashboard", dashboardUrl),
    activeWhen: location => location.pathname.startsWith("/dashboard"),
  });
  registerApplication({
    name: "mfe-transactions",
    app: () => loadRemote("mfeTransactions", transactionsUrl),
    activeWhen: location => location.pathname.startsWith("/transactions"),
  });
  registered = true;
}

export function startSingleSpa() {
  if (typeof window === "undefined") return;
  registerApps();
  if (started) return;
  start();
  started = true;
}
