import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#08090A",
          surface: "#0F1011",
          elevated: "#151617",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
        ink: {
          DEFAULT: "#F5F5F5",
          muted: "#9A9A9C",
          faint: "#5C5C5F",
        },
        segment: {
          champions: "#F5F5F5",
          champStrip: "rgba(245,245,245,0.10)",
          loyalists: "#9FB4C7",
          loyalistStrip: "rgba(159,180,199,0.12)",
          newcust: "#7FA88E",
          newcustStrip: "rgba(127,168,142,0.12)",
          atrisk: "#D08B6A",
          atriskStrip: "rgba(208,139,106,0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate(0,0)" },
          "100%": { transform: "translate(-60px,-60px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        drift: "drift 50s linear infinite",
        pulseSoft: "pulseSoft 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
