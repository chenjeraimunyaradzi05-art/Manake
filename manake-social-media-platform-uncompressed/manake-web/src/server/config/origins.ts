const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8888",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8888",
];

const splitOrigins = (value?: string): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));
};

export const normalizeOrigin = (origin?: string | null): string | null => {
  if (!origin) {
    return null;
  }

  try {
    const parsed = new URL(origin.trim());
    return parsed.origin;
  } catch {
    return null;
  }
};

export const getAllowedOrigins = (): string[] => {
  const configuredOrigins = [
    ...splitOrigins(process.env.ALLOWED_ORIGINS),
    ...splitOrigins(process.env.FRONTEND_URL),
    ...splitOrigins(process.env.NEXT_PUBLIC_SITE_URL),
    ...splitOrigins(process.env.URL),
    ...splitOrigins(process.env.DEPLOY_PRIME_URL),
  ];

  const origins = process.env.NODE_ENV === "production"
    ? configuredOrigins
    : [...configuredOrigins, ...DEFAULT_LOCAL_ORIGINS];

  return [...new Set(origins)];
};
