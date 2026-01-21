export function getApiBase() {
  const nextEnv =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined;
  const viteEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as any).env?.VITE_API_URL
      : undefined;
  return nextEnv ?? viteEnv ?? "http://localhost:4000";
}
