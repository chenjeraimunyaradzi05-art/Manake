/**
 * Theme Type Definitions
 * Design system types for the Manake platform
 */

// Theme modes
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

// Color palette scale
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

// Brand colors
export interface BrandColors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  hope: ColorScale & {
    light: string;
    DEFAULT: string;
    dark: string;
  };
}

// Status colors
export interface StatusColors {
  success: Pick<ColorScale, 50 | 100 | 200 | 500 | 600 | 700>;
  warning: Pick<ColorScale, 50 | 100 | 200 | 500 | 600 | 700>;
  error: Pick<ColorScale, 50 | 100 | 200 | 500 | 600 | 700>;
  info: Pick<ColorScale, 50 | 100 | 200 | 500 | 600 | 700>;
}

// Semantic tokens (change based on theme)
export interface SemanticColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    brand: string;
    brandSubtle: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    brand: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    disabled: string;
    placeholder: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
    overlay: string;
  };
}

// Typography
export interface Typography {
  fontFamily: {
    sans: string;
    display: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
    "6xl": string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

// Spacing scale
export interface Spacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
}

// Border radius
export interface BorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
  full: string;
}

// Shadows
export interface Shadows {
  xs: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  inner: string;
  none: string;
  primary: string;
  secondary: string;
  accent: string;
}

// Transitions
export interface Transitions {
  duration: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
    bounce: string;
    spring: string;
  };
}

// Z-index scale
export interface ZIndex {
  behind: number;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  toast: number;
  tooltip: number;
  maximum: number;
}

// Breakpoints
export interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

// Complete theme object
export interface Theme {
  colors: BrandColors & {
    neutral: ColorScale;
    status: StatusColors;
    semantic: SemanticColors;
  };
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  transitions: Transitions;
  zIndex: ZIndex;
  breakpoints: Breakpoints;
}

// Component size variants
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

// Component color variants
export type ColorVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "hope"
  | "success"
  | "warning"
  | "error"
  | "info";

// Button variants
export type ButtonVariant = "solid" | "outline" | "ghost" | "link" | "soft";

// Input states
export type InputState = "default" | "focus" | "error" | "success" | "disabled";

// Animation variants
export type AnimationVariant =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "slideUp"
  | "slideDown"
  | "slideInLeft"
  | "slideInRight"
  | "scaleIn"
  | "bounce"
  | "pulse"
  | "shimmer";
