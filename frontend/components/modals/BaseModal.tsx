"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  description?: string;
  showFooterHint?: boolean;
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
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
  // Close on Escape and prevent scroll
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        className={`fixed inset-0 sm:left-1/2 sm:top-1/2 z-50 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full h-full sm:h-auto sm:w-full ${sizeClasses[size]} sm:px-0 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="bg-card w-full h-full sm:h-auto sm:max-h-[85vh] border-0 sm:border border-border rounded-none sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          {(title || description) && (
            <div className="shrink-0 flex items-center justify-between p-6 border-b border-border">
              <div>
                {title && (
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 hover:bg-accent transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Footer */}
          {showFooterHint && (
            <div className="shrink-0 p-4 border-t border-border bg-muted/50 hidden sm:block">
              <p className="text-xs text-muted-foreground text-center">
                Press{" "}
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-semibold">
                  Esc
                </kbd>{" "}
                to close
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BaseModal;
