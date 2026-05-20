import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Simple standalone header for docs only */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Application
          </Link>
          <div className="font-bold tracking-tight">QStack Docs</div>
        </div>
      </header>

      <main className="px-4 py-12">
        {children}
      </main>
    </div>
  );
}
