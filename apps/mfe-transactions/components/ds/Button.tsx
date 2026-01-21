import { clsx } from "clsx";
import { ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "danger" | "disabled";
};

export default function Button({
  className,
  variant = "primary",
  ...props
}: Props) {
  const base =
    [
      "inline-flex items-center gap-2",
      "rounded-[var(--radius-xl2)] px-4 py-2",
      "text-sm font-medium",
      "transition",
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-offset-2",
      "focus-visible:ring-offset-[color:var(--color-bg)]",
    ].join(" ");

  const variants = {
    primary: clsx(
      "bg-brand text-on-brand",
      "hover:bg-brand-600 active:bg-brand-700",
      "focus-visible:ring-brand-400"
    ),

    ghost: clsx(
      "bg-surface-50 text-on-surface",
      "hover:bg-surface-100 active:bg-surface-100/80",
      "focus-visible:ring-border"
    ),

    danger: clsx(
      "bg-[color:var(--color-danger)] text-white",
      "hover:bg-[color:var(--color-danger)]/90 active:bg-[color:var(--color-danger)]/80",
      "focus-visible:ring-[color:var(--color-danger)]/45"
    ),
  } as const;

  const disabledVariant = clsx(
    "bg-surface-100 text-on-surface/60",
    "cursor-not-allowed opacity-60",
    "focus-visible:ring-0"
  );

  return (
    <button
      className={clsx(
        base,
        variant === "disabled" ? disabledVariant : variants[variant],
        className
      )}
      disabled={variant === "disabled" || props.disabled}
      {...props}
    />
  );
}
