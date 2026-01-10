export type ThemeMode = "light" | "dark" | "system";

export interface ThemeState {
  mode: ThemeMode;
  resolvedMode: Exclude<ThemeMode, "system">;
}

export interface ThemeContextValue extends ThemeState {
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
};

export type ColorVariant = "primary" | "secondary" | "accent" | "hope";
export type ButtonVariant = "primary" | "secondary" | "accent" | "emergency";

export type SemanticColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  ring: string;
};
