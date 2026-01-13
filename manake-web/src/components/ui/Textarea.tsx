import * as React from "react";
import { cn } from "../../utils/cn";
import { Label } from "./Label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className, rows = 4, ...props }, ref) => {
    const textareaId = id ?? React.useId();

    return (
      <div className="w-full">
        {label ? (
          <div className="mb-1">
            <Label htmlFor={textareaId}>{label}</Label>
          </div>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-semantic-text placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-semantic-ring",
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-semantic-border focus:border-semantic-ring",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
