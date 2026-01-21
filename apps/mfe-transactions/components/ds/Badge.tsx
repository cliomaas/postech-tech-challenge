import { clsx } from "clsx";
import { ComponentProps } from "react";

type BadgeProps = ComponentProps<"span"> & {
  color?: "slate" | "green" | "red" | "yellow";
};

export default function Badge({
  children,
  color = "slate",
  className,
  ...rest
}: BadgeProps) {
  const variants = {
    slate: "bg-surface-100 text-on-surface/80",
    green: "bg-success text-on-success",
    red: "bg-error text-on-error",
    yellow: "bg-warning text-on-warning",
  } as const;

  return (
    <span
      {...rest}
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
        variants[color],
        className
      )}
    >
      {children}
    </span>
  );
}
