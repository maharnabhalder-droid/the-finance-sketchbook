import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-parchment-100 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-paper-border dark:border-ink-800" />
          <div className="absolute inset-0 rounded-full border-4 border-brass border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-serif font-black text-xl text-brass">
            ₹
          </div>
        </div>
        <div>
          <span className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 block">
            Opening Inkwell Folio...
          </span>
          <span className="font-mono text-[11px] text-ink-400">
            Balancing 30-Day Ledger & Calculations
          </span>
        </div>
      </div>
    </div>
  );
}
