import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ThemeContextValue, ThemeMode } from "../types/theme";

const STORAGE_KEY = "manake:theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemPrefersDark() ? "dark" : "light";
  return mode;
}

function applyToDocument(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.classList.toggle("dark", resolved === "dark");

  // Update theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    // Keep simple: brand primary-700 for light, near-black for dark
    meta.setAttribute("content", resolved === "dark" ? "#0b1220" : "#1a62d7");
  }
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  });

  const resolvedMode = useMemo(() => resolveMode(mode), [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    applyToDocument(resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyToDocument(resolveMode("system"));

    // Initial sync
    handler();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }

    // Safari fallback
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [mode]);

  const setTheme = useCallback((next: ThemeMode) => {
    setMode(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const currentResolved = resolveMode(current);
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedMode, setTheme, toggleTheme }),
    [mode, resolvedMode, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
