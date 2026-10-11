"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to client console or monitoring service
    console.error("Inkwell Application Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-parchment-100 dark:bg-ink-950 text-ink-900 dark:text-ink-50">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-800 shadow-2xl text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-vermilion/10 text-vermilion flex items-center justify-center border border-vermilion/30">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-brass font-bold">
            Ledger Disruption
          </span>
          <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-50 mt-1">
            An Unexpected Blot Occurred
          </h2>
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            Inkwell encountered a temporary runtime calculation issue. Your saved budget and transactions in local storage remain secure.
          </p>
        </div>

        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl font-mono text-[11px] text-vermilion text-left overflow-x-auto max-h-24">
          {error.message || "Unknown ledger computation exception"}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => window.location.assign("/")}
            className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Reload Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
}
