/**
 * Manake Theme - Royal Precious Stone Design System
 * Consistent with web styling (variables.css & tailwind.config.js)
 * Feminine & Celestial Theme
 */

export const theme = {
  colors: {
    // Primary - Royal Purple (Nobility, Wisdom)
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
      DEFAULT: "#7b5da5",
    },
    // Secondary - Scarlet & Rose (Passion, Energy)
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
      DEFAULT: "#c41e3a",
    },
    // Accent - Rose Pink (Warmth, Compassion)
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
      DEFAULT: "#e85b8a",
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
      DEFAULT: "#ffd700",
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
      DEFAULT: "#10b981",
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
      DEFAULT: "#4a90e2",
    },
    // Rose Gold (Elegance)
    roseGold: {
      DEFAULT: "#b76e79",
      light: "#d4a5ad",
      dark: "#8b4f57",
    },
    // Status colors (mapped to theme)
    success: "#10b981", // Emerald
    warning: "#fbbf24", // Gold
    danger: "#c41e3a", // Secondary/Scarlet
    info: "#4a90e2", // Celestial
    // Neutral palette
    background: "#f9f3fb",
    surface: "#ffffff",
    text: "#3d383b",
    textSecondary: "#787078",
    textLight: "#a8a0a8",
    border: "#e8e0e8",
    disabled: "#d8d0d8",
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    "2xl": 48,
    "3xl": 64,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
  },
  fontFamily: {
    sans: "Inter",
    display: "Poppins",
    mono: "JetBrains Mono",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  shadows: {
    sm: {
      shadowColor: "#3a2854",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#3a2854",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#3a2854",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },
};

// Helper to get color value (handles nested objects)
export const getColor = (colorPath: string): string => {
  const parts = colorPath.split(".");
  let result: unknown = theme.colors;
  for (const part of parts) {
    if (result && typeof result === "object" && part in result) {
      result = (result as Record<string, unknown>)[part];
    } else {
      return "#000000";
    }
  }
  if (typeof result === "string") return result;
  if (typeof result === "object" && result && "DEFAULT" in result) {
    return (result as { DEFAULT: string }).DEFAULT;
  }
  return "#000000";
};
