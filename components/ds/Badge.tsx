import { clsx } from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  color?: "slate" | "green" | "red" | "yellow";
};

export default function Badge({ children, color = "slate" }: BadgeProps) {
  const map = {
    slate: "bg-white/10 text-white",
    green: "bg-green-600/30 text-green-200",
    red: "bg-red-600/30 text-red-200",
    yellow: "bg-yellow-600/30 text-yellow-200",
  };
  return <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs", map[color])}>{children}</span>;
}
