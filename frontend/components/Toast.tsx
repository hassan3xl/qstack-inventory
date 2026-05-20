// components/toast.tsx
"use client";

import { useEffect } from "react";
import { Toast as ToastType } from "@/providers/ToastProvider";

interface ToastProps {
  toast: ToastType;
  onClose: () => void;
}

const toastIcons = {
  success: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-4 h-4"
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
  ),
  warning: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
      />
    </svg>
  ),
};

const toastStyles = {
  success: {
    background: "bg-secondary",
    border: "border-border",
    text: "text-secondary-foreground",
    icon: "text-green-600 dark:text-green-400",
  },
  error: {
    background: "bg-secondary",
    border: "border-border",
    text: "text-secondary-foreground",
    icon: "text-red-600 dark:text-red-400",
  },
  warning: {
    background: "bg-secondary",
    border: "border-border",
    text: "text-secondary-foreground",
    icon: "text-yellow-600 dark:text-yellow-400",
  },
  info: {
    background: "bg-secondary",
    border: "border-border",
    text: "text-secondary-foreground",
    icon: "text-blue-600 dark:text-blue-400",
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  const styles = toastStyles[toast.type || "info"];

  useEffect(() => {
    if (toast.duration === 0) return;

    const timer = setTimeout(onClose, toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  return (
    <div
      className={`
        animate-in slide-in-from-right-full duration-300
        ${styles.background} ${styles.border} ${styles.text}
        border rounded-lg shadow-lg p-4 pr-8
        backdrop-blur-sm bg-opacity-95
        dark:bg-opacity-95
        relative
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
          {toastIcons[toast.type || "info"]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90">{toast.description}</p>
          )}
        </div>
      </div>

      <button
        onClick={onClose}
        className={`
          absolute top-3 right-3
          p-1 rounded-md
          hover:bg-accent
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-ring
        `}
        aria-label="Close toast"
      >
        <svg
          className="w-3 h-3"
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

      {/* Progress bar */}
      {toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-primary animate-toast-progress"
            style={{
              animationDuration: `${toast.duration || 5000}ms`,
              animationTimingFunction: "linear",
              animationFillMode: "forwards",
            }}
          />
        </div>
      )}
    </div>
  );
}
