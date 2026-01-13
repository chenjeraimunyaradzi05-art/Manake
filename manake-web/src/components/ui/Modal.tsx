import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";

export type ModalSize = "sm" | "md" | "lg" | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size: ModalSize;
  children: React.ReactNode;
}

const sizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  full: "max-w-none w-[min(96vw,1200px)]",
};

export function Modal({ isOpen, onClose, title, size, children }: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "Modal"}
          className={cn(
            "w-full rounded-xl bg-white shadow-xl border border-semantic-border animate-scale-in",
            sizes[size],
          )}
        >
          {title ? (
            <div className="flex items-center justify-between gap-4 border-b border-semantic-border px-5 py-4">
              <h2 className="font-display text-lg font-bold text-semantic-text">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          ) : null}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
