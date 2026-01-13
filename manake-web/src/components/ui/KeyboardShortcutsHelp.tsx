import React, { useState, useEffect, useCallback } from "react";

interface Shortcut {
  key: string;
  description: string;
  modifier?: "ctrl" | "alt" | "shift" | "meta";
}

const SHORTCUTS: Shortcut[] = [
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "g h", description: "Go to home" },
  { key: "g s", description: "Go to stories" },
  { key: "g f", description: "Go to social feed" },
  { key: "g m", description: "Go to messages" },
  { key: "g p", description: "Go to profile" },
  { key: "/", description: "Focus search" },
  { key: "n", description: "New post" },
  { key: "j", description: "Next item" },
  { key: "k", description: "Previous item" },
  { key: "Escape", description: "Close modal / Cancel" },
];

/**
 * Keyboard shortcuts help dialog
 * Press ? to show/hide the shortcuts overlay
 */
export const KeyboardShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }

    // ? key to toggle help
    if (e.key === "?" && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }

    // Escape to close
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="shortcuts-title" className="text-lg font-semibold">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close shortcuts"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <ul className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <li
                key={shortcut.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                  {shortcut.key}
                </kbd>
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1 bg-gray-200 dark:bg-gray-700 rounded">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
