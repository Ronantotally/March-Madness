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
        background: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "text-primary": "rgb(var(--text-1) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-2) / <alpha-value>)",
        "accent-gold": "rgb(var(--gold) / <alpha-value>)",
        "accent-green": "rgb(var(--green) / <alpha-value>)",
        "accent-orange": "rgb(var(--orange) / <alpha-value>)",
        "accent-red": "rgb(var(--red) / <alpha-value>)",
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
