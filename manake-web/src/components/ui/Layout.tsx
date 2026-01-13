import * as React from "react";
import { cn } from "../../utils/cn";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

const gapClasses = {
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
} as const;

const gridColsClasses = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

const spacerHeights = {
  2: "h-2",
  3: "h-3",
  4: "h-4",
  6: "h-6",
  8: "h-8",
  10: "h-10",
  12: "h-12",
} as const;

export function Stack({
  gap = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { gap?: 2 | 3 | 4 | 6 | 8 }) {
  return <div className={cn("flex flex-col", gapClasses[gap], className)} {...props} />;
}

export function HStack({
  gap = 4,
  align = "center",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  gap?: 2 | 3 | 4 | 6 | 8;
  align?: "start" | "center" | "end" | "baseline";
}) {
  const alignClass =
    align === "start"
      ? "items-start"
      : align === "end"
        ? "items-end"
        : align === "baseline"
          ? "items-baseline"
          : "items-center";

  return <div className={cn("flex", gapClasses[gap], alignClass, className)} {...props} />;
}

export function Grid({
  cols = 2,
  gap = 4,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 3 | 4 | 6 | 8;
}) {
  return (
    <div
      className={cn(
        "grid",
        gridColsClasses[cols],
        gapClasses[gap],
        className,
      )}
      {...props}
    />
  );
}

export function Divider({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) {
  return <hr className={cn("border-semantic-border", className)} {...props} />;
}

export function Spacer({ size = 4 }: { size?: 2 | 3 | 4 | 6 | 8 | 10 | 12 }) {
  return <div aria-hidden="true" className={spacerHeights[size]} />;
}

export type BoxProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

export function Box<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: BoxProps<T>) {
  const Comp = as ?? "div";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Comp className={cn(className)} {...(props as any)} />;
}
