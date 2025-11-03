import { clsx } from "clsx";
import { ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  variant?: "primary" | "ghost" | "danger" | "disabled";
};

export default function Button({ className, variant = "primary", ...props }: Props) {
  const base = "inline-flex items-center gap-2 rounded-xl2 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-700 focus:ring-brand-400",
    ghost: "bg-white/10 hover:bg-white/20 focus:ring-white/40",
    danger: "bg-danger hover:bg-danger/90 focus:ring-danger/60",
  };

  const disabledVariant = clsx(
    variants.ghost,
    "opacity-50 cursor-not-allowed hover:bg-white/10 focus:ring-0"
  )
  return <button className={clsx(base, variant === "disabled" ? disabledVariant : variants[variant], className)} {...props} />;
}
