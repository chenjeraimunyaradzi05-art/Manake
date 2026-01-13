/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals metrics for performance optimization
 */

type MetricHandler = (metric: {
  name: string;
  value: number;
  id: string;
  rating: "good" | "needs-improvement" | "poor";
}) => void;

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  rating: "good" | "needs-improvement" | "poor";
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

function getRating(
  name: string,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return "good";
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

// Default handler logs to console in development
const defaultHandler: MetricHandler = (metric) => {
  const ratingEmoji = {
    good: "✅",
    "needs-improvement": "⚠️",
    poor: "❌",
  };

  if (import.meta.env.DEV) {
    console.log(
      `${ratingEmoji[metric.rating]} [${metric.name}] ${metric.value.toFixed(2)} (${metric.rating})`
    );
  }

  // In production, you could send to analytics
  if (import.meta.env.PROD && window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_rating: metric.rating,
    });
  }
};

let handlers: MetricHandler[] = [defaultHandler];

export function onWebVitals(handler: MetricHandler): void {
  handlers.push(handler);
}

function reportMetric(metric: WebVitalsMetric): void {
  handlers.forEach((handler) => handler(metric));
}

export async function initWebVitals(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const { onCLS, onLCP, onFCP, onTTFB, onINP } = await import(
      "web-vitals"
    );

    const createReporter = (name: string) => (metric: { value: number; id: string }) => {
      reportMetric({
        name,
        value: metric.value,
        id: metric.id,
        rating: getRating(name, metric.value),
      });
    };

    onCLS(createReporter("CLS"));
    onLCP(createReporter("LCP"));
    onFCP(createReporter("FCP"));
    onTTFB(createReporter("TTFB"));
    onINP(createReporter("INP"));
  } catch (error) {
    console.warn("Web Vitals not available:", error);
  }
}

// Performance observer for custom metrics
export function observePerformance(): void {
  if (typeof window === "undefined" || !window.PerformanceObserver) return;

  // Long Task Observer (tasks > 50ms)
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (import.meta.env.DEV && entry.duration > 100) {
          console.warn(`⚠️ Long Task detected: ${entry.duration.toFixed(0)}ms`);
        }
      });
    });
    longTaskObserver.observe({ entryTypes: ["longtask"] });
  } catch {
    // Long task observer not supported
  }

  // Resource timing for slow resources
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        if (resourceEntry.duration > 1000 && import.meta.env.DEV) {
          console.warn(
            `⚠️ Slow resource: ${resourceEntry.name} (${resourceEntry.duration.toFixed(0)}ms)`
          );
        }
      });
    });
    resourceObserver.observe({ entryTypes: ["resource"] });
  } catch {
    // Resource observer not supported
  }
}

// Get current performance summary
export function getPerformanceSummary(): Record<string, number> {
  const navigation = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;
  
  if (!navigation) return {};

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domParse: navigation.domInteractive - navigation.responseEnd,
    domReady: navigation.domContentLoadedEventEnd - navigation.responseEnd,
    load: navigation.loadEventEnd - navigation.responseEnd,
  };
}

// Extend window for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
