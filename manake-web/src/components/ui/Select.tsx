import * as React from "react";
import { cn } from "../../utils/cn";
import { Label } from "./Label";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, id, className, options, placeholder, ...props },
    ref,
  ) => {
    const selectId = id ?? React.useId();

    return (
      <div className="w-full">
        {label ? (
          <div className="mb-1">
            <Label htmlFor={selectId}>{label}</Label>
          </div>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-semantic-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-semantic-ring",
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-semantic-border focus:border-semantic-ring",
            className,
          )}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
