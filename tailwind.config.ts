import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        forest: {
          950: "#071D17",
          900: "#0B241D",
          800: "#063B2E",
          700: "#0E513D",
        },
        green: {
          50: "#EEF4EB",
          100: "#DDE8D8",
          500: "#5F9F38",
          600: "#367C3B",
          700: "#2B6530",
        },
        lime: { indicator: "#A8D84E" },
        ivory: "#F5F5EF",
        gold: { DEFAULT: "#C4A35A", light: "#E8D8AE", dark: "#8A6F2E" },
        ink: { DEFAULT: "#10211B", muted: "#5B6862" },
        line: "#DDE4DF",
        danger: "#C94A42",
        warning: "#D6922E",
        success: "#367C3B",
      },
      fontFamily: {
        heading: ["'Manrope Variable'", "Manrope", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        figures: ["'Space Grotesk Variable'", "'Inter Variable'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(16,33,27,0.04), 0 1px 1px rgba(16,33,27,0.03)",
        pop: "0 8px 24px rgba(16,33,27,0.12)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: { shimmer: "shimmer 1.4s infinite" },
    },
  },
  plugins: [],
};

export default config;
