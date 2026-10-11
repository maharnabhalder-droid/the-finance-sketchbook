"use client";

import React, { useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { TheLens } from "../components/TheLens";
import { TheLedgerBook } from "../components/TheLedgerBook";
import { LandingCover } from "../components/LandingCover";
import { useFinanceStore, LedgerPageId } from "../lib/store/useFinanceStore";

const PAGES_ORDER: LedgerPageId[] = [
  "overview",
  "spending",
  "commitments",
  "goals",
  "simulator",
  "forecast",
  "health",
  "report",
];

export default function Home() {
  const isBookOpen = useFinanceStore((state) => state.isBookOpen);
  const openBook = useFinanceStore((state) => state.openBook);
  const activePage = useFinanceStore((state) => state.activePage);
  const setActivePage = useFinanceStore((state) => state.setActivePage);
  const theme = useFinanceStore((state) => state.theme);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === "midnight") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Keyboard navigation for realistic page flipping (← and →)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger page turn when typing in input/textarea/select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const currentIndex = PAGES_ORDER.indexOf(activePage);

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setActivePage(PAGES_ORDER[currentIndex - 1]);
      } else if (e.key === "ArrowRight" && currentIndex < PAGES_ORDER.length - 1) {
        setActivePage(PAGES_ORDER[currentIndex + 1]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePage, setActivePage]);

  return (
    <main className="min-h-screen bg-parchment-100 dark:bg-ink-950 text-ink-900 dark:text-ink-50 transition-colors duration-300 relative selection:bg-brass selection:text-white pb-12">
      {/* Skip to Main Content link for keyboard & screen reader a11y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brass focus:text-white focus:rounded-lg focus:shadow-2xl focus:font-bold focus:text-xs focus:ring-2 focus:ring-offset-2 focus:ring-brass"
      >
        Skip to main content
      </a>

      {/* Brass Loupe Cursor Follower */}
      <TheLens />

      {/* Top Navigation */}
      <Navbar />

      {/* Content View: Closed Sketchbook Landing or Open 3D Ledger */}
      <div id="main-content" tabIndex={-1} className="pt-2 sm:pt-4 outline-none">
        {!isBookOpen ? (
          <LandingCover onOpenBook={openBook} />
        ) : (
          <TheLedgerBook />
        )}
      </div>
    </main>
  );
}
