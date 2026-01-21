import { clsx } from "clsx";
import { ComponentProps } from "react";

export default function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={clsx(
        "rounded-2xl shadow-sm border transition-colors",
        "bg-white border-gray-200",
        "dark:bg-surface-100/40 dark:border-white/10",
        className
      )}
      {...props}
    />
  );
}
