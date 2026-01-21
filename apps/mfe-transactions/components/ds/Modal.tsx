"use client";
import { ReactNode, useEffect } from "react";
import { clsx } from "clsx";

export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      className={clsx(
        "fixed inset-0 z-50 grid place-items-center p-4 transition-colors",
        "bg-[color:var(--color-bg)]/40 backdrop-blur-[2px]"
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          "w-full max-w-lg rounded-[var(--radius-xl2)] border shadow-lg p-4 transition-all",
          "bg-[color:var(--color-card)]/80 backdrop-blur-md",
          "border-[color:var(--color-border)] text-[color:var(--color-on-surface)]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
