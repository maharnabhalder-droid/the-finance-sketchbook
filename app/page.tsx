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
      {/* Brass Loupe Cursor Follower */}
      <TheLens />

      {/* Top Navigation */}
      <Navbar />

      {/* Content View: Closed Sketchbook Landing or Open 3D Ledger */}
      <div className="pt-2 sm:pt-4">
        {!isBookOpen ? (
          <LandingCover onOpenBook={openBook} />
        ) : (
          <TheLedgerBook />
        )}
      </div>
    </main>
  );
}
