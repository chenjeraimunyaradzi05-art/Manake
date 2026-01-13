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
        // Royal Purple - Primary (Nobility, Wisdom)
        primary: {
          50: "#f5f0fb",
          100: "#ebe0f7",
          200: "#d7c1ef",
          300: "#c3a2e7",
          400: "#9b7ec4",
          500: "#7b5da5",
          600: "#6b4c9a",
          700: "#5a3d82",
          800: "#4a3269",
          900: "#3a2854",
          950: "#1a0f2e",
        },
        // Scarlet & Rose - Secondary (Passion, Energy)
        secondary: {
          50: "#fef2f4",
          100: "#fde6ea",
          200: "#fbd0d9",
          300: "#f7a8b9",
          400: "#e85b8a",
          500: "#c41e3a",
          600: "#a81832",
          700: "#800020",
          800: "#6b1a2b",
          900: "#5c1b2a",
          950: "#330a13",
        },
        // Rose Pink - Accent (Warmth, Compassion)
        accent: {
          50: "#fef7fb",
          100: "#fdeef6",
          200: "#fcddef",
          300: "#f9c4e3",
          400: "#f4a4d3",
          500: "#e85b8a",
          600: "#d64d7d",
          700: "#b83d67",
          800: "#983554",
          900: "#7f3149",
          950: "#4d1528",
        },
        // Gold (Success, Achievement)
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ffd700",
          600: "#d4a000",
          700: "#a67c00",
          800: "#854d0e",
          900: "#713f12",
          950: "#422006",
        },
        // Emerald (Growth, Healing)
        emerald: {
          50: "#e0f7e8",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#50c878",
          500: "#10b981",
          600: "#2d7a5a",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Celestial Blue (Trust, Serenity)
        celestial: {
          50: "#f0f8ff",
          100: "#e0f0ff",
          200: "#bae2ff",
          300: "#87ceeb",
          400: "#5fb8e8",
          500: "#4a90e2",
          600: "#3573c4",
          700: "#2a5aa0",
          800: "#264b84",
          900: "#24406c",
          950: "#192948",
        },
        // Rose Gold
        "rose-gold": {
          DEFAULT: "#b76e79",
          light: "#d4a5ad",
          dark: "#8b4f57",
        },
        // Hope Colors
        hope: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ffd700",
          600: "#d4a000",
          700: "#a67c00",
          800: "#854d0e",
          900: "#713f12",
          950: "#422006",
        },
        // Status Colors
        status: {
          success: "#50c878",
          warning: "#ffd700",
          error: "#c41e3a",
          info: "#4a90e2",
        },
        // Cosmic Colors
        cosmic: {
          deep: "#1a0f2e",
          purple: "#2d1b69",
        },
        // Diamond Colors
        diamond: {
          white: "#f8f6ff",
          sparkle: "#ffffff",
          light: "#f0f8ff",
        },
        // Semantic Colors
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
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        primary: "var(--shadow-primary)",
        secondary: "var(--shadow-secondary)",
        accent: "var(--shadow-accent)",
        gold: "0 8px 25px rgba(255, 215, 0, 0.35)",
        emerald: "0 10px 25px -10px rgba(80, 200, 120, 0.30)",
        "diamond-glow": "0 0 30px rgba(255, 215, 0, 0.4), 0 0 60px rgba(232, 91, 138, 0.2)",
      },
      backgroundImage: {
        "gradient-cosmic": "linear-gradient(135deg, #1a0f2e 0%, #2d1b69 50%, #6b4c9a 100%)",
        "gradient-royal": "linear-gradient(135deg, #6b4c9a 0%, #9b7ec4 50%, #f4a4d3 100%)",
        "gradient-rose": "linear-gradient(135deg, #c41e3a 0%, #e85b8a 50%, #f4a4d3 100%)",
        "gradient-emerald": "linear-gradient(135deg, #2d7a5a 0%, #50c878 50%, #6ee7b7 100%)",
        "gradient-gold": "linear-gradient(135deg, #a67c00 0%, #ffd700 50%, #fef3c7 100%)",
        "gradient-celestial": "linear-gradient(135deg, #2a5aa0 0%, #4a90e2 50%, #87ceeb 100%)",
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
        "diamond-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(232, 91, 138, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(255, 215, 0, 0.6), 0 0 60px rgba(232, 91, 138, 0.3)" },
        },
        "celestial-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "diamond-shine": {
          "0%": { transform: "translateX(-100%) rotate(45deg)" },
          "100%": { transform: "translateX(100%) rotate(45deg)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 300ms ease-out",
        "slide-in-left": "slide-in-left 300ms ease-out",
        "slide-in-right": "slide-in-right 300ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        "diamond-glow": "diamond-glow 2s ease-in-out infinite",
        "celestial-pulse": "celestial-pulse 3s ease-in-out infinite",
        "diamond-shine": "diamond-shine 3s ease-in-out infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
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
