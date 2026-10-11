import React from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-parchment-100 dark:bg-ink-950 text-ink-900 dark:text-ink-50">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-800 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brass/10 text-brass flex items-center justify-center border border-brass/30">
          <BookOpen className="w-8 h-8" />
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-brass font-bold">
            Chapter Not Found · 404
          </span>
          <h2 className="font-serif text-3xl font-black text-ink-900 dark:text-ink-50 mt-1">
            Missing Ledger Page
          </h2>
          <p className="text-xs text-ink-500 mt-2 leading-relaxed">
            The page or chapter folio you are seeking does not exist in this 30-day notebook.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Notebook Cover</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
