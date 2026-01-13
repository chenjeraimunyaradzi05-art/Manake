import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import * as Sentry from "@sentry/react";
import App from "./App";
import "./styles/globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastViewport } from "./components/ui";
import { QueryProvider } from "./context/QueryProvider";
import { initWebVitals } from "./utils/webVitals";

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

function scrubPII(event: Sentry.Event): Sentry.Event | null {
  if (import.meta.env.MODE === "development") return null;

  if (event.user) {
    // Remove user-identifying fields
    delete event.user.email;
    delete (event.user as any).ip_address;
  }

  if (event.request) {
    if (event.request.headers) {
      const { authorization, cookie, ...rest } = event.request.headers;
      event.request.headers = rest;
    }
    delete (event.request as any).cookies;
    delete (event.request as any).data;
  }

  return event;
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enabled: Boolean(import.meta.env.VITE_SENTRY_DSN),
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  beforeSend: scrubPII,
});

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "red" }}>Something went wrong</h1>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16 }}>
        {error.message}
      </pre>
      <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, fontSize: 12 }}>
        {error.stack}
      </pre>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
