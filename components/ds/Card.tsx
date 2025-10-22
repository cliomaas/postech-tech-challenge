import { clsx } from "clsx";
import { ComponentProps } from "react";

export default function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={clsx("rounded-2xl bg-surface-100/40 border border-white/10 shadow-sm", className)} {...props} />;
}
