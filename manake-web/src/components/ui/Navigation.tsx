import * as React from "react";
import { cn } from "../../utils/cn";

export function Navbar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <header className={cn("w-full border-b border-semantic-border bg-white", className)}>
      {children}
    </header>
  );
}

export function Sidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "w-full md:w-64 border-r border-semantic-border bg-white",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function Tabs({
  value,
  onValueChange,
  tabs,
  className,
}: {
  value: string;
  onValueChange: (next: string) => void;
  tabs: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", className)} role="tablist">
      {tabs.map((t) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onValueChange(t.value)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold",
              selected
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

export function Breadcrumb({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-gray-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a className="hover:underline" href={item.href}>
                  {item.label}
                </a>
              ) : (
                <span className={isLast ? "text-semantic-text" : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-semantic-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-semantic-border px-3 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
