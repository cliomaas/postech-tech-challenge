import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8ff",
          100: "#d9ecff",
          200: "#b7dbff",
          300: "#8cc5ff",
          400: "#5aa8ff",
          500: "#2f87ff",
          600: "#1569f0",
          700: "#0f53c4",
          800: "#0f469c",
          900: "#0f3c81"
        },
        success: { DEFAULT: "#16a34a" },
        danger: { DEFAULT: "#dc2626" },
        warning: { DEFAULT: "#f59e0b" },
        surface: {
          DEFAULT: "#0b0f14",
          50: "#0f141b",
          100: "#111827"
        }
      },
      borderRadius: {
        xl2: "1rem",
      }
    },
  },
  plugins: [],
} satisfies Config;
