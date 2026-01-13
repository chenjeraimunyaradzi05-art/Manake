import * as React from "react";
import { cn } from "../../utils/cn";

export function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-label="Loading"
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600",
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-pulse rounded-md bg-gray-200",
        className,
      )}
      {...props}
    />
  );
}

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full rounded-full bg-gray-200", className)}>
      <div
        className="h-2 rounded-full bg-primary-600 transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
