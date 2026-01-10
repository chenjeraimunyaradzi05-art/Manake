/**
 * Centralized Logger Utility
 * Provides structured logging with different levels and formats
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

interface LoggerOptions {
  minLevel?: LogLevel;
  includeTimestamp?: boolean;
  pretty?: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Logger class with configurable options
 */
class Logger {
  private minLevel: LogLevel;
  private includeTimestamp: boolean;
  private pretty: boolean;

  constructor(options: LoggerOptions = {}) {
    this.minLevel =
      options.minLevel ||
      (process.env.NODE_ENV === "production" ? "info" : "debug");
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.pretty = options.pretty ?? process.env.NODE_ENV !== "production";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatEntry(entry: LogEntry): string {
    if (this.pretty) {
      const levelColors: Record<LogLevel, string> = {
        debug: "\x1b[36m", // Cyan
        info: "\x1b[32m", // Green
        warn: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
      };
      const reset = "\x1b[0m";
      const color = levelColors[entry.level];

      let output = "";
      if (this.includeTimestamp) {
        output += `\x1b[90m${entry.timestamp}${reset} `;
      }
      output += `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

      if (entry.data && Object.keys(entry.data).length > 0) {
        output += `\n${JSON.stringify(entry.data, null, 2)}`;
      }

      return output;
    }

    // JSON format for production (structured logging)
    return JSON.stringify(entry);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "debug":
      case "info":
        console.log(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log("error", message, data);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, context);
  }
}

/**
 * Child logger that includes parent context in all logs
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private context: Record<string, unknown>,
  ) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.parent.debug(message, { ...this.context, ...data });
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.parent.info(message, { ...this.context, ...data });
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.parent.warn(message, { ...this.context, ...data });
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.parent.error(message, { ...this.context, ...data });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for custom instances
export { Logger };
export type { LoggerOptions, LogLevel, LogEntry };
