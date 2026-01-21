import { ComponentProps } from "react";
import { clsx } from "clsx";

type Props = ComponentProps<"select"> & { label?: string };

export default function Select({ label, id, children, className, ...props }: Props) {
  const select = (
    <div className="relative">
      <select
        id={id}
        className={clsx(
          "w-full appearance-none rounded-[var(--radius-xl2)] border px-3 py-2 text-sm transition-colors",
          "bg-[color:var(--color-input)] border-[color:var(--color-border)] text-[color:var(--color-on-surface)]",
          "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-[color:var(--color-brand)]",
          "pr-8",
          className
        )}
        {...props}
      >
        {children}
      </select>

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--color-on-surface)]/70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );

  if (!label) return select;

  return (
    <label htmlFor={id} className="block text-sm space-y-1">
      <span className="text-[color:var(--color-on-surface)]/90">{label}</span>
      {select}
    </label>
  );
}
