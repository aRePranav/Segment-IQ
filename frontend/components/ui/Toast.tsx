"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "error" | "success" | "info";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastKind, LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const COLORS: Record<ToastKind, string> = {
  error: "border-segment-atrisk/30 text-segment-atrisk",
  success: "border-segment-newcust/30 text-segment-newcust",
  info: "border-border-strong text-ink",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: number) =>
    setToasts((t) => t.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.kind];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className={cn(
                  "pointer-events-auto flex items-start gap-3 rounded-lg border bg-bg-elevated px-4 py-3 shadow-2xl shadow-black/40",
                  COLORS[toast.kind]
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1 text-sm text-ink">{toast.message}</p>
                <button
                  onClick={() => dismiss(toast.id)}
                  className="text-ink-faint hover:text-ink"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
