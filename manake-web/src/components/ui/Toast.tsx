import { cn } from "../../utils/cn";
import { useToast } from "../../context/ToastContext";

const styles = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
} as const;

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-[min(92vw,420px)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "rounded-lg border px-4 py-3 shadow-md animate-fade-in-up",
            styles[t.type],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium leading-snug">{t.message}</p>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-black/5"
              onClick={() => dismissToast(t.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
