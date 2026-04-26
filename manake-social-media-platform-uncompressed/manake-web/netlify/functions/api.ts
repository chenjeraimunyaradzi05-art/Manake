type NetlifyEvent = {
  httpMethod?: string;
  path?: string;
  rawUrl?: string;
  headers?: Record<string, string | undefined>;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

const allowedMethods = "GET, OPTIONS";

const normalizeOrigin = (origin: string | undefined): string | null => {
  if (!origin) {
    return null;
  }

  try {
    const parsed = new URL(origin);
    return parsed.origin;
  } catch {
    return null;
  }
};

const getAllowedOrigins = (): string[] => {
  return [
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    process.env.CONTEXT === "production" ? process.env.DEPLOY_URL : undefined,
    process.env.FRONTEND_URL,
    "https://manake.netlify.app",
  ]
    .map(normalizeOrigin)
    .filter((origin): origin is string => Boolean(origin));
};

const getCorsOrigin = (requestOrigin: string | undefined): string => {
  const normalizedRequestOrigin = normalizeOrigin(requestOrigin);

  if (!normalizedRequestOrigin) {
    return "*";
  }

  if (process.env.NODE_ENV !== "production") {
    return normalizedRequestOrigin;
  }

  return getAllowedOrigins().includes(normalizedRequestOrigin) ? normalizedRequestOrigin : "null";
};

const json = (
  statusCode: number,
  body: Record<string, unknown>,
  requestOrigin: string | undefined,
): NetlifyResponse => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Allow-Origin": getCorsOrigin(requestOrigin),
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  },
  body: JSON.stringify(body),
});

const getRequestPath = (event: NetlifyEvent): string => {
  if (event.rawUrl) {
    try {
      return new URL(event.rawUrl).pathname;
    } catch {
      return event.rawUrl;
    }
  }

  return event.path ?? "/";
};

const isHealthPath = (path: string): boolean => {
  return ["/health", "/api/health", "/.netlify/functions/api/health"].includes(path);
};

const isDiagnosticsPath = (path: string): boolean => {
  return [
    "/api/diagnostics/public",
    "/diagnostics/public",
    "/.netlify/functions/api/diagnostics/public",
  ].includes(path);
};

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  const method = event.httpMethod ?? "GET";
  const requestOrigin = event.headers?.origin ?? event.headers?.Origin;

  if (method === "OPTIONS") {
    return json(204, {}, requestOrigin);
  }

  if (method !== "GET") {
    return json(405, { error: "Method not allowed" }, requestOrigin);
  }

  const path = getRequestPath(event);

  if (isHealthPath(path) || path === "/" || path === "/.netlify/functions/api") {
    return json(
      200,
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        apiBase: "/api",
        backend: "netlify-function",
      },
      requestOrigin,
    );
  }

  if (isDiagnosticsPath(path)) {
    return json(
      200,
      {
        status: "ok",
        netlifyFunctionReady: true,
        configuredOrigins: getAllowedOrigins().length,
      },
      requestOrigin,
    );
  }

  return json(
    404,
    {
      error: "API route not found",
      message:
        "The Netlify function is available for health checks. Configure the external backend URL for application API routes.",
    },
    requestOrigin,
  );
};
