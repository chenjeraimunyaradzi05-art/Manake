import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./styles/globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastViewport } from "./components/ui";
import { QueryProvider } from "./context/QueryProvider";
import { initWebVitals } from "./utils/webVitals";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Initialize Web Vitals monitoring
initWebVitals();

// Register service worker for offline support
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("ServiceWorker registration failed:", error);
    });
  });
}

const beforeSend: Sentry.BrowserOptions["beforeSend"] = (event, hint) => {
  void hint;
  if (import.meta.env.MODE === "development") return null;

  if (event.user) {
    // Remove user-identifying fields
    delete event.user.email;
    delete event.user.ip_address;
  }

  if (event.request) {
    if (event.request.headers) {
      const headers = { ...event.request.headers };
      delete headers.authorization;
      delete headers.cookie;
      event.request.headers = headers;
    }
    delete event.request.cookies;
    delete event.request.data;
  }

  return event;
};

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: Boolean(import.meta.env.VITE_SENTRY_DSN),
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <QueryProvider>
            <App />
            <ToastViewport />
          </QueryProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
