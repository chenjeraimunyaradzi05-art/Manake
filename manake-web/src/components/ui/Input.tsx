import * as React from "react";
import { cn } from "../../utils/cn";
import { Label } from "./Label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    icon,
    id,
    className,
    type = "text",
    ...props
  },
  ref) => {
    const inputId = id ?? React.useId();
    const describedByIds = [
      error ? `${inputId}-error` : null,
      helperText ? `${inputId}-help` : null,
    ].filter(Boolean);

    return (
      <div className="w-full">
        {label ? (
          <div className="mb-1">
            <Label htmlFor={inputId}>{label}</Label>
          </div>
        ) : null}
        <div className="relative">
          {icon ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              {icon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={Boolean(error)}
            aria-describedby={describedByIds.length ? describedByIds.join(" ") : undefined}
            className={cn(
              "w-full rounded-lg border bg-white px-4 py-3 text-sm text-semantic-text placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-semantic-ring",
              icon ? "pl-10" : undefined,
              error
                ? "border-red-500 focus:ring-red-400"
                : "border-semantic-border focus:border-semantic-ring",
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-600">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
