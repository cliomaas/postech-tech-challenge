import { ComponentProps } from "react";

type Props = ComponentProps<"select"> & { label?: string };

export default function Select({ label, id, children, ...props }: Props) {
  const el = (
    <select
      id={id}
      className="w-full rounded-xl2 bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      {...props}
    >
      {children}
    </select>
  );
  if (!label) return el;
  return (
    <label htmlFor={id} className="block text-sm space-y-1">
      <span className="text-white/80">{label}</span>
      {el}
    </label>
  );
}
