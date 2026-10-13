import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        forest: {
          950: "#071D17",
          900: "#0B3026",
          800: "#063B2E",
          700: "#0E513D",
        },
        green: {
          50: "#EAF3E9",
          100: "#D8E8D5",
          500: "#4E9A3A",
          600: "#2F7D3B",
          700: "#256A30",
        },
        lime: { indicator: "#A8D84E" },
        ivory: "#FFFFFF",
        gold: { DEFAULT: "#C4A35A", light: "#E8D8AE", dark: "#8A6F2E" },
        ink: { DEFAULT: "#14251F", muted: "#65736C" },
        line: "#E4EAE5",
        danger: "#C94A42",
        warning: "#D6922E",
        success: "#2F8A45",
      },
      fontFamily: {
        heading: ["'Manrope Variable'", "Manrope", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        figures: ["'Space Grotesk Variable'", "'Inter Variable'", "system-ui", "sans-serif"],
      },
      borderRadius: { card: "12px" },
      boxShadow: {
        card: "0 1px 2px rgba(20,37,31,0.04)",
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
