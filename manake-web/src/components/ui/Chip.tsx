import * as React from "react";
import { cn } from "../../utils/cn";

export function Chip({
  className,
  onRemove,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  onRemove?: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      {onRemove ? (
        <button
          type="button"
          className="rounded-full px-1 hover:bg-black/10"
          onClick={onRemove}
          aria-label="Remove"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
