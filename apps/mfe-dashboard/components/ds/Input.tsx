import { ComponentProps } from "react";
import { clsx } from "clsx";

type Props = ComponentProps<"input"> & { label?: string; hint?: string };

export default function Input({ label, hint, className, id, ...props }: Props) {
  const input = (
    <input
      id={id}
      className={clsx(
        "w-full rounded-[var(--radius-xl2)] border px-3 py-2 text-sm transition-colors",
        "bg-[color:var(--color-input)] border-[color:var(--color-border)] text-[color:var(--color-on-surface)]",
        "placeholder-[color:var(--color-on-surface)]/60",
        "focus:outline-none focus:ring-2 focus:ring-[color:var(--color-brand)] focus:border-[color:var(--color-brand)]",
        className
      )}
      {...props}
    />
  );

  if (!label) return input;

  return (
    <label htmlFor={id} className="block text-sm space-y-1">
      <span className="text-[color:var(--color-on-surface)]/90">{label}</span>
      {input}
      {hint && (
        <span className="text-xs text-[color:var(--color-on-surface)]/60">
          {hint}
        </span>
      )}
    </label>
  );
}
