import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/single-spa.tsx"),
      name: "mfeTransactions",
      formats: ["umd"],
      fileName: () => "mfe-transactions.umd.js",
    },
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 9102,
    strictPort: true,
  },
});
