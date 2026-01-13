import * as React from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant = "neutral" | "primary" | "secondary" | "accent";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-gray-100 text-gray-800",
  primary: "bg-primary-50 text-primary-700",
  secondary: "bg-green-50 text-green-700",
  accent: "bg-orange-50 text-orange-700",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
