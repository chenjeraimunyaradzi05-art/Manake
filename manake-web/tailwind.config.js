import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff8ff",
          100: "#dbeefe",
          200: "#bee2fe",
          300: "#91d1fd",
          400: "#5db8f9",
          500: "#3899f5",
          600: "#2279ea",
          700: "#1a62d7",
          800: "#1c50ae",
          900: "#1c4589",
          950: "#152b53",
        },
        secondary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        hope: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        status: {
          success: "#16a34a",
          warning: "#d97706",
          error: "#dc2626",
          info: "#2563eb",
        },
        semantic: {
          bg: "rgb(var(--semantic-bg) / <alpha-value>)",
          surface: "rgb(var(--semantic-surface) / <alpha-value>)",
          surfaceAlt: "rgb(var(--semantic-surface-alt) / <alpha-value>)",
          text: "rgb(var(--semantic-text) / <alpha-value>)",
          textMuted: "rgb(var(--semantic-text-muted) / <alpha-value>)",
          border: "rgb(var(--semantic-border) / <alpha-value>)",
          ring: "rgb(var(--semantic-ring) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        primary: "var(--shadow-primary)",
        secondary: "var(--shadow-secondary)",
        accent: "var(--shadow-accent)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 300ms ease-out",
        "slide-in-left": "slide-in-left 300ms ease-out",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      typography: {
        DEFAULT: {
          css: {
            color: "rgb(var(--semantic-text))",
          },
        },
        invert: {
          css: {
            color: "rgb(var(--semantic-text))",
          },
        },
      },
    },
  },
  plugins: [forms({ strategy: "class" }), typography, animate],
};
