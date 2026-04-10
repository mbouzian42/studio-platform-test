"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "default" | "success" | "error" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

// Global toast state - simple pub/sub pattern
let toastListeners: Array<(toast: Toast) => void> = [];
let toastId = 0;

export function toast({
  title,
  description,
  variant = "default",
}: Omit<Toast, "id">) {
  const newToast: Toast = {
    id: String(++toastId),
    title,
    description,
    variant,
  };
  toastListeners.forEach((listener) => listener(newToast));
}

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border-subtle bg-bg-surface",
  success: "border-success/30 bg-success/10",
  error: "border-error/30 bg-error/10",
  warning: "border-warning/30 bg-warning/10",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToast: Toast) => {
      setToasts((prev) => [...prev, newToast]);
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 md:bottom-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-right-5",
            variantStyles[t.variant ?? "default"]
          )}
          role="alert"
        >
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{t.title}</p>
            {t.description && (
              <p className="mt-1 text-xs text-text-secondary">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
