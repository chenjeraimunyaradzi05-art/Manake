type LogDetails = Record<string, unknown>;

const redactSensitiveDetails = (details?: LogDetails): LogDetails | undefined => {
  if (!details) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => {
      if (/secret|token|password|authorization|cookie|key/i.test(key)) {
        return [key, "[redacted]"];
      }

      return [key, value];
    }),
  );
};

const writeLog = (level: "debug" | "info" | "warn" | "error", message: string, details?: LogDetails): void => {
  const safeDetails = redactSensitiveDetails(details);
  const payload = safeDetails ? [message, safeDetails] : [message];

  if (level === "debug" && process.env.NODE_ENV === "production") {
    return;
  }

  console[level](...payload);
};

export const logger = {
  debug: (message: string, details?: LogDetails) => writeLog("debug", message, details),
  info: (message: string, details?: LogDetails) => writeLog("info", message, details),
  warn: (message: string, details?: LogDetails) => writeLog("warn", message, details),
  error: (message: string, details?: LogDetails) => writeLog("error", message, details),
};
