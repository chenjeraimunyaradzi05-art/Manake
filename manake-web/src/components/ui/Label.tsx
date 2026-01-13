import * as React from "react";
import { cn } from "../../utils/cn";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium text-semantic-text", className)}
        {...props}
      >
        {children}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
    );
  },
);
Label.displayName = "Label";
