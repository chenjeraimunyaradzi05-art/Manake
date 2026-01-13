import * as React from "react";
import { cn } from "../../utils/cn";

export type CardVariant = "elevated" | "outlined" | "filled";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  onClick?: () => void;
}

const variants: Record<CardVariant, string> = {
  elevated: "bg-white shadow-md",
  outlined: "bg-white border border-semantic-border",
  filled: "bg-gray-50",
};

export function Card({
  variant = "elevated",
  hoverable,
  onClick,
  className,
  ...props
}: CardProps) {
  const clickable = Boolean(onClick);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "rounded-xl overflow-hidden",
        variants[variant],
        hoverable ? "transition-shadow duration-200 hover:shadow-lg" : undefined,
        clickable ? "cursor-pointer" : undefined,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-b border-semantic-border", props.className)} {...props} />;
}

export function CardBody(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", props.className)} {...props} />;
}

export function CardFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 border-t border-semantic-border", props.className)} {...props} />;
}
