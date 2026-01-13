import * as React from "react";
import { cn } from "../../utils/cn";

export type AlertType = "success" | "error" | "warning" | "info";

const styles: Record<AlertType, string> = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

export function Alert({
  type,
  title,
  children,
  className,
}: {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", styles[type], className)}>
      {title ? <div className="mb-1 text-sm font-bold">{title}</div> : null}
      <div className="text-sm">{children}</div>
    </div>
  );
}
