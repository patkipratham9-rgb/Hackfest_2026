import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFAF6",
          100: "#FBF8F3",
          200: "#F5EFE6",
          300: "#ECE3D4",
          400: "#DDD0BD",
          500: "#C6B59D",
        },
        terracotta: {
          50: "#FDF5F0",
          100: "#FCE8DC",
          200: "#F8CCA9",
          300: "#F19D6B",
          400: "#EB7D3E",
          500: "#E26D35",
          600: "#C85620",
          700: "#A34114",
          800: "#833513",
          900: "#6B2D13",
        },
        forest: {
          50: "#F1F7F4",
          100: "#E0EEE7",
          200: "#C2DDD0",
          300: "#97C3B0",
          400: "#5D9D82",
          500: "#2B5841",
          600: "#1E4734",
          700: "#1B3B2B",
          800: "#152E22",
          900: "#10231A",
          950: "#08140E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(27, 59, 43, 0.08)",
        "warm-lg": "0 10px 30px -4px rgba(226, 109, 53, 0.15)",
        floating: "0 12px 36px -6px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
