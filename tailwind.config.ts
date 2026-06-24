import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Dark Blue — Primary / Trust
        navy: {
          50: "#eef2f9",
          100: "#d6dff0",
          200: "#aebfe0",
          300: "#7c93c9",
          400: "#4f69ad",
          500: "#324a8c",
          600: "#26396e",
          700: "#1c2b55",
          800: "#131d3b",
          900: "#0b1226",
          950: "#060a17",
        },
        // Vibrant Orange — Action / Accent
        accent: {
          50: "#fff5ed",
          100: "#ffe7d3",
          200: "#ffcaa5",
          300: "#ffa46d",
          400: "#ff7a33",
          500: "#ff6b1a",
          600: "#f0530a",
          700: "#c63d0b",
          800: "#9d3211",
          900: "#7e2c12",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1da851",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(11 18 38 / 0.08), 0 1px 2px -1px rgb(11 18 38 / 0.06)",
        "card-hover":
          "0 12px 28px -8px rgb(11 18 38 / 0.18), 0 4px 10px -4px rgb(11 18 38 / 0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
