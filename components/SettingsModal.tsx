"use client";

import React, { useRef, useState } from "react";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Search,
  Eye,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useFinanceStore } from "../lib/store/useFinanceStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const theme = useFinanceStore((state) => state.theme);
  const setTheme = useFinanceStore((state) => state.setTheme);
  const isLensActive = useFinanceStore((state) => state.isLensActive);
  const toggleLens = useFinanceStore((state) => state.toggleLens);
  const reducedMotion = useFinanceStore((state) => state.reducedMotion);
  const setReducedMotion = useFinanceStore((state) => state.setReducedMotion);
  const resetToDemo = useFinanceStore((state) => state.resetToDemo);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export local state as JSON file
  const handleExportJSON = () => {
    const state = useFinanceStore.getState();
    const exportData = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      startBudget: state.startBudget,
      currentDay: state.currentDay,
      transactions: state.transactions,
      commitments: state.commitments,
      subscriptions: state.subscriptions,
      goals: state.goals,
      incomeEvents: state.incomeEvents,
      unexpectedEvents: state.unexpectedEvents,
      unlockedBadges: state.unlockedBadges,
      streakDays: state.streakDays,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inkwell-ledger-day${state.currentDay}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON file to restore state
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.startBudget && Array.isArray(json.transactions)) {
          useFinanceStore.setState({
            startBudget: json.startBudget,
            currentDay: json.currentDay || 1,
            transactions: json.transactions || [],
            commitments: json.commitments || [],
            subscriptions: json.subscriptions || [],
            goals: json.goals || [],
            incomeEvents: json.incomeEvents || [],
            unexpectedEvents: json.unexpectedEvents || [],
            unlockedBadges: json.unlockedBadges || [],
            streakDays: json.streakDays || 0,
          });
          setImportStatus("Ledger successfully imported! ✓");
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus("Error: Invalid ledger JSON schema.");
        }
      } catch (err) {
        setImportStatus("Error: Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700/80 rounded-3xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brass/10 text-brass flex items-center justify-center font-bold" aria-hidden="true">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 id="settings-modal-title" className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
                Ledger Settings
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                Preferences & Data Backup
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close settings dialog"
            className="text-ink-400 hover:text-ink-900 dark:hover:text-ink-100 text-lg p-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4 text-xs">
          {/* Theme Selection */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-parchment-50/60 dark:bg-ink-950/60 border border-paper-border dark:border-ink-800">
            <div>
              <span className="font-bold text-ink-900 dark:text-ink-100 block">
                Folio Theme
              </span>
              <span className="text-[11px] text-ink-500">
                Warm Parchment or Midnight Ink paper
              </span>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-800">
              <button
                onClick={() => setTheme("parchment")}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                  theme === "parchment"
                    ? "bg-brass text-white shadow-sm"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                <Sun className="w-3 h-3" />
                <span>Parchment</span>
              </button>
              <button
                onClick={() => setTheme("midnight")}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1 transition-all ${
                  theme === "midnight"
                    ? "bg-brass text-white shadow-sm"
                    : "text-ink-500 hover:text-ink-100"
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Midnight</span>
              </button>
            </div>
          </div>

          {/* The Brass Lens Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-parchment-50/60 dark:bg-ink-950/60 border border-paper-border dark:border-ink-800">
            <div>
              <span className="font-bold text-ink-900 dark:text-ink-100 block">
                The Brass Lens (Loupe Inspector)
              </span>
              <span className="text-[11px] text-ink-500">
                Reveals mathematical formulas upon hover
              </span>
            </div>

            <button
              onClick={toggleLens}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                isLensActive
                  ? "bg-sage/15 text-sage-dark dark:text-sage-light border-sage/40"
                  : "bg-black/5 dark:bg-white/5 text-ink-500 border-paper-border"
              }`}
            >
              {isLensActive ? "Enabled ✓" : "Disabled"}
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-parchment-50/60 dark:bg-ink-950/60 border border-paper-border dark:border-ink-800">
            <div>
              <span className="font-bold text-ink-900 dark:text-ink-100 block">
                Reduced Motion
              </span>
              <span className="text-[11px] text-ink-500">
                Disables 3D page flip and loupe follower physics
              </span>
            </div>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all ${
                reducedMotion
                  ? "bg-brass/20 text-brass border-brass/40"
                  : "bg-black/5 dark:bg-white/5 text-ink-500 border-paper-border"
              }`}
            >
              {reducedMotion ? "ON" : "OFF"}
            </button>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-xl bg-sage/10 border border-sage/30 flex items-center gap-2.5 text-sage-dark dark:text-sage-light">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] leading-snug">
              <strong>100% Local Privacy</strong>: Your budget, transactions, and goals never leave this browser. State is saved only in device localStorage.
            </span>
          </div>

          {/* Data Backup & Restore */}
          <div className="p-3.5 rounded-xl border border-paper-border dark:border-ink-800 space-y-2.5">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
              Ledger Backup & Export
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>

            {importStatus && (
              <p className="text-[11px] font-mono text-center text-brass font-bold pt-1">
                {importStatus}
              </p>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 border-t border-paper-border dark:border-ink-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Reset all transactions, goals, and dues to the default Indian Gen Z demo dataset?"
                  )
                ) {
                  resetToDemo();
                  onClose();
                }
              }}
              className="text-xs text-vermilion hover:underline flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Dataset (Day 12 / ₹10,000)</span>
            </button>

            <button
              onClick={onClose}
              className="btn-primary text-xs py-1.5 px-4 font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
