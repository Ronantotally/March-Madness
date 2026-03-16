import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0b0f",
        surface: "#12141a",
        border: "#1e2028",
        "text-primary": "#e8e9ed",
        "text-secondary": "#8a8f98",
        "accent-gold": "#F5A623",
        "accent-green": "#2EC4B6",
        "accent-orange": "#FF6B35",
        "accent-red": "#E63946",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
