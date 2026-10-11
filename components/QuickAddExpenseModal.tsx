"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Zap, Check, Sparkles } from "lucide-react";
import { useFinanceStore } from "../lib/store/useFinanceStore";
import { ExpenseCategory, ExpenseSentiment } from "../lib/engine/types";
import { formatINR } from "../lib/engine/finance";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { label: ExpenseCategory; icon: string }[] = [
  { label: "Food & Dining", icon: "🍛" },
  { label: "Transport & Commute", icon: "🚇" },
  { label: "Shopping & Personal", icon: "🛍️" },
  { label: "Entertainment & Gaming", icon: "🎮" },
  { label: "Bills & Utilities", icon: "⚡" },
  { label: "Academics & Books", icon: "📚" },
  { label: "Health & Emergency", icon: "💊" },
  { label: "Other", icon: "✨" },
];

const PRESETS = [
  { title: "Tapri Chai & Samosa", amount: 50, category: "Food & Dining" as ExpenseCategory },
  { title: "Metro SmartCard Swipe", amount: 40, category: "Transport & Commute" as ExpenseCategory },
  { title: "Swiggy Canteen Lunch", amount: 160, category: "Food & Dining" as ExpenseCategory },
  { title: "Zepto Quick Snack", amount: 120, category: "Food & Dining" as ExpenseCategory },
  { title: "Assignment Printouts", amount: 75, category: "Academics & Books" as ExpenseCategory },
];

export function QuickAddExpenseModal({ isOpen, onClose }: QuickAddModalProps) {
  const currentDay = useFinanceStore((state) => state.currentDay);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const getDayState = useFinanceStore((state) => state.getDayState);

  const dayState = getDayState();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Food & Dining");
  const [isEssential, setIsEssential] = useState(false);
  const [sentiment, setSentiment] = useState<ExpenseSentiment>("neutral");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const daysLeft = Math.max(1, 31 - currentDay);
  const allowanceImpactPerDay = Math.round(numAmount / daysLeft);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || numAmount <= 0) return;

    addTransaction({
      title: title.trim(),
      amount: numAmount,
      day: currentDay,
      category,
      note: note.trim() || undefined,
      isEssential,
      sentiment,
    });

    // Reset and close
    setTitle("");
    setAmount("");
    setNote("");
    setSentiment("neutral");
    onClose();
  };

  const handleApplyPreset = (p: (typeof PRESETS)[0]) => {
    setTitle(p.title);
    setAmount(p.amount.toString());
    setCategory(p.category);
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-saffron/15 text-saffron flex items-center justify-center text-sm font-bold" aria-hidden="true">
              ⚡
            </span>
            <h3 id="quick-add-title" className="font-serif text-lg font-bold text-ink-900 dark:text-ink-100">
              Quick Log Expense (Day {currentDay})
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close quick log modal"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-400 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block mb-1.5">
            UPI Quick Tap Shortcuts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] font-mono px-2 py-1 rounded-md bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 border border-paper-border dark:border-ink-700 hover:border-brass transition-all"
              >
                {p.title} ({formatINR(p.amount)})
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
              What did you spend on?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Paneer Roll"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-brass/50 text-ink-900 dark:text-ink-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-ink-400 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  placeholder="120"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-brass/50 text-ink-900 dark:text-ink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100 focus:outline-none focus:ring-2 focus:ring-brass/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.label} value={cat.label}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
              Short note or friend split tag (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Split 50% with Rohan on UPI"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 focus:outline-none focus:ring-2 focus:ring-brass/50 text-ink-900 dark:text-ink-100"
            />
          </div>

          {/* Mindfulness Sentiment Tag */}
          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Mindfulness Sentiment (Did this feel worth it?)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSentiment("worth_it")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                  sentiment === "worth_it"
                    ? "bg-sage/20 border-sage text-sage-dark dark:text-sage-light shadow-sm"
                    : "border-paper-border dark:border-ink-700 text-ink-500 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span>✨ Worth it</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment("neutral")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                  sentiment === "neutral"
                    ? "bg-brass/20 border-brass text-brass shadow-sm"
                    : "border-paper-border dark:border-ink-700 text-ink-500 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span>😐 Neutral</span>
              </button>
              <button
                type="button"
                onClick={() => setSentiment("regret")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass ${
                  sentiment === "regret"
                    ? "bg-vermilion/20 border-vermilion text-vermilion shadow-sm"
                    : "border-paper-border dark:border-ink-700 text-ink-500 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span>💔 Regret</span>
              </button>
            </div>
          </div>

          {/* Essential Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="essential-check"
              checked={isEssential}
              onChange={(e) => setIsEssential(e.target.checked)}
              className="rounded text-brass focus:ring-brass"
            />
            <label
              htmlFor="essential-check"
              className="text-xs text-ink-600 dark:text-ink-400 select-none cursor-pointer"
            >
              Mark as non-negotiable survival essential (groceries, metro, medical)
            </label>
          </div>

          {/* Live Ripple Preview */}
          {numAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200"
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Consequence Ripple:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Subtracts {formatINR(numAmount)} from remaining balance. Trims safe daily allowance by{" "}
                <strong>-{formatINR(allowanceImpactPerDay)}/day</strong> across the remaining {daysLeft} days.
              </p>
            </motion.div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-paper-border dark:border-ink-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-600 dark:text-ink-300 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={numAmount <= 0 || !title.trim()}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-brass hover:bg-brass-dark text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all hover:scale-[1.02]"
            >
              Log Expense
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
