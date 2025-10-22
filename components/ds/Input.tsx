import { ComponentProps } from "react";
import { clsx } from "clsx";

type Props = ComponentProps<"input"> & { label?: string; hint?: string; };

export default function Input({ label, hint, className, id, ...props }: Props) {
  const input = (
    <input
      id={id}
      className={clsx("w-full rounded-xl2 bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500", className)}
      {...props}
    />
  );
  if (!label) return input;
  return (
    <label htmlFor={id} className="block text-sm space-y-1">
      <span className="text-white/80">{label}</span>
      {input}
      {hint && <span className="text-xs text-white/50">{hint}</span>}
    </label>
  );
}
