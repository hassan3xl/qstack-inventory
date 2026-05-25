"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  description?: string;
  showFooterHint?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showFooterHint = true,
}) => {
  // Escape key + body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
       * ── Scroll container ───────────────────────────────────────
       * Full-screen flex column that scrolls as a whole on mobile,
       * and centres the panel on larger screens via padding trick.
       */}
      <div
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        /* Clicking the gutters (not the panel) closes the modal */
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/*
         * ── Panel ──────────────────────────────────────────────
         * On mobile: full height, full width, no rounding at top.
         * On sm+: auto height, rounded, max-height safety cap so
         *         very long forms still scroll internally.
         */}
        <div
          className={`
            relative w-full bg-card flex flex-col
            min-h-screen sm:min-h-0
            sm:max-h-[90vh]
            border-0 sm:border sm:border-border
            rounded-none sm:rounded-2xl
            shadow-2xl
            ${sizeClasses[size]}
            animate-in fade-in zoom-in-95 duration-200
          `}
          /* Prevent backdrop click from propagating through the panel */
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Sticky Header ──────────────────────────────────── */}
          {(title || description) && (
            <div className="shrink-0 flex items-start justify-between gap-4 p-6 border-b border-border bg-card sticky top-0 rounded-t-none sm:rounded-t-2xl z-10">
              <div className="flex-1 min-w-0">
                {title && (
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground leading-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="shrink-0 rounded-xl p-2 hover:bg-accent transition-colors cursor-pointer mt-0.5"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* ── Scrollable Body ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* ── Sticky Footer hint ─────────────────────────────── */}
          {showFooterHint && (
            <div className="shrink-0 p-3 border-t border-border bg-muted/40 hidden sm:flex items-center justify-center gap-2 rounded-b-2xl">
              <kbd className="px-2 py-1 bg-background border border-border rounded text-[10px] font-semibold text-muted-foreground">
                Esc
              </kbd>
              <span className="text-[11px] text-muted-foreground">to close</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BaseModal;
