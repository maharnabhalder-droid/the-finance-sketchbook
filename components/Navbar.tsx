"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Sliders,
  TrendingUp,
  Award,
  Sun,
  Moon,
  Search,
  Plus,
  RotateCcw,
  FastForward,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useFinanceStore, LedgerPageId } from "../lib/store/useFinanceStore";
import { QuickAddExpenseModal } from "./QuickAddExpenseModal";

export function Navbar() {
  const currentDay = useFinanceStore((state) => state.currentDay);
  const activePage = useFinanceStore((state) => state.activePage);
  const setActivePage = useFinanceStore((state) => state.setActivePage);
  const theme = useFinanceStore((state) => state.theme);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);
  const isLensActive = useFinanceStore((state) => state.isLensActive);
  const toggleLens = useFinanceStore((state) => state.toggleLens);
  const advanceToNextDay = useFinanceStore((state) => state.advanceToNextDay);
  const fastForwardToDay = useFinanceStore((state) => state.fastForwardToDay);
  const resetToDemo = useFinanceStore((state) => state.resetToDemo);
  const streakDays = useFinanceStore((state) => state.streakDays);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isFastForwardOpen, setIsFastForwardOpen] = useState(false);
  const [fastForwardDayInput, setFastForwardDayInput] = useState(currentDay);

  const navItems: { id: LedgerPageId; label: string; icon: any }[] = [
    { id: "overview", label: "Notebook", icon: BookOpen },
    { id: "spending", label: "Spending", icon: TrendingUp },
    { id: "commitments", label: "Fixed Dues", icon: ShieldAlert },
    { id: "goals", label: "Goals", icon: Award },
    { id: "simulator", label: "Simulate", icon: Sliders },
    { id: "forecast", label: "Forecast & Risk", icon: TrendingUp },
    { id: "health", label: "Health", icon: Award },
    { id: "report", label: "Report Card", icon: BookOpen },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-parchment-50/90 dark:bg-ink-950/90 border-b border-paper-border dark:border-ink-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Serif Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage("overview")}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-brass flex items-center justify-center text-white shadow-sm font-serif font-black text-lg">
                I
              </div>
              <div>
                <span className="font-serif font-black text-xl tracking-tight text-ink-900 dark:text-ink-50 group-hover:text-brass transition-colors">
                  INKWELL
                </span>
                <span className="hidden sm:block text-[9px] font-mono uppercase tracking-widest text-ink-400 -mt-1">
                  The Finance Sketchbook
                </span>
              </div>
            </button>

            {/* Streak Chip */}
            {streakDays > 0 && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono font-bold bg-sage-light dark:bg-sage-dark/40 text-sage-dark dark:text-sage-light px-2 py-0.5 rounded-full border border-sage/30">
                🔥 {streakDays}d Streak
              </span>
            )}
          </div>

          {/* Center: Main Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-parchment-100/70 dark:bg-ink-900/70 p-1 rounded-xl border border-paper-border dark:border-ink-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white dark:bg-ink-800 text-brass shadow-sm font-bold border border-paper-border dark:border-ink-700"
                      : "text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Controls & Day Counter */}
          <div className="flex items-center gap-2">
            {/* Quick Add Expense button */}
            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brass hover:bg-brass-dark text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
              title="Quick Log a UPI or cash expense"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {/* Day Counter & Fast-Forward Pill */}
            <div className="flex items-center bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-800 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => setIsFastForwardOpen(true)}
                className="px-2.5 py-1 text-xs font-mono font-bold text-ink-800 dark:text-ink-200 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors flex items-center gap-1"
                title="Click to jump or fast-forward days"
              >
                <span>Day {currentDay}/30</span>
              </button>
              <button
                onClick={advanceToNextDay}
                disabled={currentDay >= 30}
                className="px-1.5 py-1 text-xs text-brass hover:bg-brass/10 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Advance to Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* The Lens Toggle */}
            <button
              onClick={toggleLens}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                isLensActive
                  ? "bg-brass/15 text-brass border-brass/40 dark:bg-brass/25"
                  : "border-paper-border dark:border-ink-800 text-ink-500 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              title={isLensActive ? "The Lens Inspector is ON" : "Turn The Lens ON"}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle (Parchment vs Midnight) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-paper-border dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={`Switch to ${theme === "parchment" ? "Midnight Ink" : "Parchment"} theme`}
            >
              {theme === "parchment" ? (
                <Moon className="w-4 h-4 text-ink-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
            </button>

            {/* Reset Demo button */}
            <button
              onClick={() => {
                if (window.confirm("Reset all 30 days to the default Indian Gen Z demo dataset?")) {
                  resetToDemo();
                }
              }}
              className="p-2 rounded-lg border border-paper-border dark:border-ink-800 text-ink-400 hover:text-vermilion hover:bg-vermilion/10 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 px-4 gap-1.5 border-t border-paper-border dark:border-ink-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-brass text-white shadow-sm font-bold"
                    : "bg-black/5 dark:bg-white/5 text-ink-600 dark:text-ink-400"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Quick Add Expense Modal */}
      <QuickAddExpenseModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Fast Forward Modal */}
      {isFastForwardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl p-5">
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-100 mb-2">
              Time Travel: Advance Simulation Day
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Slide to any day from Day 1 to Day 30 to see how your runway and allowance adapt over time.
            </p>

            <div className="mb-6">
              <div className="flex justify-between font-mono text-xs font-bold mb-2">
                <span>Day {fastForwardDayInput}</span>
                <span>{30 - fastForwardDayInput} days left</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={fastForwardDayInput}
                onChange={(e) => setFastForwardDayInput(parseInt(e.target.value))}
                className="w-full accent-brass cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsFastForwardOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-black/5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  fastForwardToDay(fastForwardDayInput);
                  setIsFastForwardOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-brass text-white rounded-lg hover:bg-brass-dark"
              >
                Jump to Day {fastForwardDayInput}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
