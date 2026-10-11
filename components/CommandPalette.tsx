"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  Sliders,
  TrendingUp,
  Award,
  ShieldAlert,
  Plus,
  Moon,
  Sun,
  RotateCcw,
  FastForward,
  Settings,
  Sparkles,
  Zap,
  ArrowRight,
  X,
} from "lucide-react";
import { useFinanceStore, LedgerPageId } from "../lib/store/useFinanceStore";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAdd: () => void;
  onOpenSettings: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Navigation" | "Quick Actions" | "Simulations";
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenQuickAdd,
  onOpenSettings,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const activePage = useFinanceStore((state) => state.activePage);
  const setActivePage = useFinanceStore((state) => state.setActivePage);
  const toggleTheme = useFinanceStore((state) => state.toggleTheme);
  const theme = useFinanceStore((state) => state.theme);
  const isLensActive = useFinanceStore((state) => state.isLensActive);
  const toggleLens = useFinanceStore((state) => state.toggleLens);
  const advanceToNextDay = useFinanceStore((state) => state.advanceToNextDay);
  const resetToDemo = useFinanceStore((state) => state.resetToDemo);
  const addSimulationDecision = useFinanceStore((state) => state.addSimulationDecision);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-overview",
      title: "Chapter 01: Notebook Overview",
      subtitle: "Safe daily allowance, remaining cash, and today's status",
      category: "Navigation",
      icon: BookOpen,
      action: () => setActivePage("overview"),
      keywords: ["home", "today", "balance", "allowance", "hud"],
    },
    {
      id: "nav-spending",
      title: "Chapter 02: Spending & Habit Sliders",
      subtitle: "Filter past transactions, UPI expenses, and essentials",
      category: "Navigation",
      icon: TrendingUp,
      action: () => setActivePage("spending"),
      keywords: ["expenses", "transactions", "upi", "history", "table"],
    },
    {
      id: "nav-commitments",
      title: "Chapter 03: Fixed Bills & Subscriptions",
      subtitle: "Phone recharges, rent, transit pass, and recurring drains",
      category: "Navigation",
      icon: ShieldAlert,
      action: () => setActivePage("commitments"),
      keywords: ["bills", "recharge", "jio", "netflix", "dues", "rent"],
    },
    {
      id: "nav-goals",
      title: "Chapter 04: Wishlist & Savings Goals",
      subtitle: "Goa trip, earbuds replacement, and concert allocations",
      category: "Navigation",
      icon: Award,
      action: () => setActivePage("goals"),
      keywords: ["targets", "vacation", "trip", "earbuds", "wishes"],
    },
    {
      id: "nav-simulator",
      title: "Chapter 05: What-If Decision Simulator",
      subtitle: "Test hypothetical purchases before spending real money",
      category: "Navigation",
      icon: Sliders,
      action: () => setActivePage("simulator"),
      keywords: ["hypothetical", "sandbox", "test", "ripple", "decisions"],
    },
    {
      id: "nav-forecast",
      title: "Chapter 06: 3-Cone Forecast & Risk",
      subtitle: "Best, Expected, and Worst trajectory cones to Day 30",
      category: "Navigation",
      icon: TrendingUp,
      action: () => setActivePage("forecast"),
      keywords: ["chart", "cones", "projections", "runway", "risk", "wax seal"],
    },
    {
      id: "nav-health",
      title: "Chapter 07: Health Composite Index",
      subtitle: "Mindfulness quotient, behavioral badges, and 5-pillar scores",
      category: "Navigation",
      icon: Award,
      action: () => setActivePage("health"),
      keywords: ["vitality", "grade", "mindfulness", "regret", "badges"],
    },
    {
      id: "nav-report",
      title: "Chapter 08: Month-End Report Card",
      subtitle: "Final financial report and Gen Z behavioral review",
      category: "Navigation",
      icon: BookOpen,
      action: () => setActivePage("report"),
      keywords: ["summary", "grades", "final", "audit", "review"],
    },

    // Quick Actions
    {
      id: "action-add-expense",
      title: "Quick Log Expense",
      subtitle: "Log a new UPI or cash spend with mindfulness sentiment",
      category: "Quick Actions",
      icon: Plus,
      action: onOpenQuickAdd,
      keywords: ["spend", "upi", "swiggy", "metro", "chai", "buy"],
    },
    {
      id: "action-toggle-lens",
      title: `Turn Formula Lens ${isLensActive ? "Off" : "On"}`,
      subtitle: "Brass magnifying loupe revealing mathematical formulas",
      category: "Quick Actions",
      icon: Search,
      action: toggleLens,
      keywords: ["loupe", "inspector", "math", "formulas", "magnify"],
    },
    {
      id: "action-toggle-theme",
      title: `Switch Theme to ${theme === "parchment" ? "Midnight Ink" : "Parchment"}`,
      subtitle: "Toggle between warm sketchbook cream and deep navy folio",
      category: "Quick Actions",
      icon: theme === "parchment" ? Moon : Sun,
      action: toggleTheme,
      keywords: ["dark", "light", "midnight", "parchment", "mode", "color"],
    },
    {
      id: "action-advance-day",
      title: "Advance to Next Day",
      subtitle: "Step calendar day forward and update safe daily allowance",
      category: "Quick Actions",
      icon: FastForward,
      action: advanceToNextDay,
      keywords: ["next", "step", "day", "calendar", "forward"],
    },
    {
      id: "action-open-settings",
      title: "Open Settings & Backup",
      subtitle: "Export/Import JSON ledger snapshot or adjust parameters",
      category: "Quick Actions",
      icon: Settings,
      action: onOpenSettings,
      keywords: ["backup", "export", "import", "json", "config"],
    },
    {
      id: "action-reset-demo",
      title: "Reset to Fresh Demo Data",
      subtitle: "Restore pristine college student ₹10k dataset",
      category: "Quick Actions",
      icon: RotateCcw,
      action: resetToDemo,
      keywords: ["restart", "clean", "fresh", "demo", "seed"],
    },

    // Simulations
    {
      id: "sim-hoodie",
      title: "Simulate: Impulse ₹1,200 Myntra Hoodie",
      subtitle: "See allowance drop and Goa trip delay in the simulator",
      category: "Simulations",
      icon: Zap,
      action: () => {
        addSimulationDecision({
          title: "Myntra Oversized Streetwear Hoodie",
          type: "one_off_purchase",
          amount: 1200,
          notes: "Shopping impulse simulation",
        });
        setActivePage("simulator");
      },
      keywords: ["simulate", "purchase", "clothes", "shopping", "hoodie"],
    },
    {
      id: "sim-netflix",
      title: "Simulate: Cancel Netflix (Save ₹199/mo)",
      subtitle: "Watch safe daily allowance increase across remaining cycle",
      category: "Simulations",
      icon: Sparkles,
      action: () => {
        addSimulationDecision({
          title: "Cancel Netflix Mobile Plan",
          type: "cancel_subscription",
          amount: 199,
          targetId: "sub_1",
        });
        setActivePage("simulator");
      },
      keywords: ["simulate", "save", "cut", "netflix", "cancel"],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const subtitleMatch = cmd.subtitle.toLowerCase().includes(q);
    const keywordMatch = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
    return titleMatch || subtitleMatch || keywordMatch;
  });

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-paper-border dark:border-ink-800 bg-parchment-50/50 dark:bg-ink-950/50">
          <Search className="w-5 h-5 text-brass shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-autocomplete="list"
            placeholder="Search chapters, quick actions, or simulate decisions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close Command Palette"
            className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id="command-listbox"
          role="listbox"
          className="overflow-y-auto p-2 divide-y divide-paper-border/40 dark:divide-ink-800/40"
        >
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink-400 italic font-sans">
              No actions found matching "{query}". Try "simulate", "chapter", or "bills".
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  id={`command-option-${cmd.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-brass/10 dark:bg-brass/20 text-brass font-semibold"
                      : "text-ink-700 dark:text-ink-300 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-brass text-white shadow-sm"
                          : "bg-black/5 dark:bg-white/5 text-ink-500"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-900 dark:text-ink-50 truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-ink-500">
                          {cmd.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-500 dark:text-ink-400 block truncate mt-0.5">
                        {cmd.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? "translate-x-0.5 opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2 border-t border-paper-border dark:border-ink-800 bg-parchment-50/50 dark:bg-ink-950/50 flex items-center justify-between text-[11px] font-mono text-ink-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-paper-border dark:border-ink-700 mr-1">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-paper-border dark:border-ink-700 mr-1">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 border border-paper-border dark:border-ink-700 mr-1">
              Esc
            </kbd>
            Close
          </span>
        </div>
      </motion.div>
    </div>
  );
}
