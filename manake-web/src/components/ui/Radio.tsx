import * as React from "react";
import { cn } from "../../utils/cn";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, ...props }, ref) => {
    const radioId = id ?? React.useId();

    return (
      <label className="inline-flex items-center gap-2 text-sm text-semantic-text">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          className={cn(
            "h-4 w-4 border-semantic-border text-primary-600 focus:ring-semantic-ring",
            className,
          )}
          {...props}
        />
        {label ? <span>{label}</span> : null}
      </label>
    );
  },
);
Radio.displayName = "Radio";
