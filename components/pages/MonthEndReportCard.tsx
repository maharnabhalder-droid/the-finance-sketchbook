"use client";

import React, { useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle,
  Copy,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Zap,
  RotateCcw,
} from "lucide-react";
import { DayState } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";
import { WaxSealStamp } from "../WaxSealStamp";

interface MonthEndReportCardProps {
  dayState: DayState;
}

export function MonthEndReportCard({ dayState }: MonthEndReportCardProps) {
  const currentDay = useFinanceStore((state) => state.currentDay);
  const goals = useFinanceStore((state) => state.goals);
  const transactions = useFinanceStore((state) => state.transactions);
  const resetToDemo = useFinanceStore((state) => state.resetToDemo);
  const fastForwardToDay = useFinanceStore((state) => state.fastForwardToDay);

  const [copied, setCopied] = useState(false);

  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.saved, 0);
  const startBudget = dayState.startBudget;
  const netSurplus = dayState.remainingBalance;

  const letterGrade = dayState.health.grade;

  const bestDecisions = [
    "Maintained student discount on Spotify (₹59/mo vs ₹119 regular)",
    `Preserved an unspent buffer of ₹${formatINR(Math.max(0, netSurplus))} across the month`,
    "Used Metro Rail pass over surge Ola auto-rickshaws for daily commute",
  ];

  const lessonsLearned = [
    "Friday evening food delivery orders consumed ~35% of weekly discretionary allowance",
    "Single unexpected phone screen repair required quick reallocation from Goa trip goal",
    "Small impulse UPI snack spends accumulated to ₹450+ without conscious notice",
  ];

  const handleCopySummary = () => {
    const text = `📓 INKWELL Month-End Report Card (Day ${currentDay}/30)
━━━━━━━━━━━━━━━━━━━━━━━━━━
• Overall Grade: ${letterGrade} (${dayState.health.score}/100)
• Starting 30-Day Budget: ₹${formatINR(startBudget)}
• Discretionary Spent: ₹${formatINR(totalSpent)}
• Capital Saved in Goals: ₹${formatINR(totalSaved)}
• Closing Cash Balance: ₹${formatINR(netSurplus)}
• Safe Daily Allowance: ₹${formatINR(dayState.safeDailyAllowance)}/day
• Risk Rating: ${dayState.risk.level} (${dayState.risk.score}/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━
Simulated with INKWELL · The Gen Z Finance Sketchbook`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Chapter Subheading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border dark:border-ink-800 pb-3">
        <div>
          <span className="font-hand text-lg text-ink-500 block -mb-1">
            "The 30th Page: Graduation & Audit..."
          </span>
          <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
            30-Day Executive Report Card & Ledger Folio
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied to Clipboard!" : "Copy Summary"}
          </button>
          {currentDay < 30 && (
            <button
              onClick={() => fastForwardToDay(30)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Fast-Forward to Day 30
            </button>
          )}
        </div>
      </div>

      {/* Diplomatic Physical Report Card Container */}
      <div className="relative bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700/80 rounded-2xl p-6 sm:p-8 shadow-sketchbook dark:shadow-sketchbook-dark overflow-hidden">
        {/* Corner Wax Seal */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <WaxSealStamp risk={dayState.risk} size="md" />
        </div>

        {/* Certificate Header */}
        <div className="text-center border-b-2 border-dashed border-paper-border dark:border-ink-800 pb-6 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-brass font-bold">
            Official Fiscal Assessment
          </span>
          <h4 className="font-serif text-3xl sm:text-4xl font-black text-ink-900 dark:text-ink-50 mt-1">
            INKWELL LEDGER FOLIO
          </h4>
          <p className="font-hand text-lg text-ink-600 dark:text-ink-300 mt-1">
            "A verified chronicle of decisions, trade-offs, and composure over ₹10,000"
          </p>
        </div>

        {/* Big Grade & Headline Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-parchment-50 dark:bg-ink-950/60 border border-paper-border dark:border-ink-800 mb-6">
          <div className="text-center sm:border-r border-paper-border dark:border-ink-800 sm:pr-4">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-400">
              Grade
            </span>
            <div className="font-serif text-5xl font-black text-ink-900 dark:text-ink-50 mt-1">
              {letterGrade}
            </div>
            <span className="text-[11px] text-brass font-mono font-bold">
              Health: {dayState.health.score}/100
            </span>
          </div>

          <div className="text-center sm:border-r border-paper-border dark:border-ink-800 sm:pr-4">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-400">
              Closing Balance
            </span>
            <div className="font-serif text-2xl font-black text-ink-900 dark:text-ink-50 mt-2">
              ₹{formatINR(netSurplus)}
            </div>
            <span className="text-[11px] text-ink-400 font-mono">
              from ₹10k seed budget
            </span>
          </div>

          <div className="text-center sm:border-r border-paper-border dark:border-ink-800 sm:pr-4">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-400">
              Capital Saved
            </span>
            <div className="font-serif text-2xl font-black text-lavender mt-2">
              ₹{formatINR(totalSaved)}
            </div>
            <span className="text-[11px] text-lavender font-mono">
              Allocated to wishlist goals
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono uppercase font-bold text-ink-400">
              Total Spent
            </span>
            <div className="font-serif text-2xl font-black text-ink-800 dark:text-ink-200 mt-2">
              ₹{formatINR(totalSpent)}
            </div>
            <span className="text-[11px] text-ink-400 font-mono">
              Over {transactions.length} transactions
            </span>
          </div>
        </div>

        {/* Two Columns: Tactical Triumphs vs Friction Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Tactical Triumphs */}
          <div className="p-4 rounded-xl border border-sage/40 bg-sage/5">
            <h5 className="font-serif text-sm font-bold text-sage-dark dark:text-sage-light flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sage" />
              Tactical Triumphs (What Worked)
            </h5>
            <ul className="space-y-2 text-xs text-ink-700 dark:text-ink-300">
              {bestDecisions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-sage shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coaching Adjustments */}
          <div className="p-4 rounded-xl border border-saffron/40 bg-saffron/5">
            <h5 className="font-serif text-sm font-bold text-saffron flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-saffron" />
              Adjustments for Next Cycle
            </h5>
            <ul className="space-y-2 text-xs text-ink-700 dark:text-ink-300">
              {lessonsLearned.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-saffron font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mentor Handwriting Annotation */}
        <div className="p-4 rounded-xl border border-paper-border dark:border-ink-800 bg-parchment-50/70 dark:bg-ink-950/60 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-brass/10 text-brass flex items-center justify-center font-serif font-black shrink-0">
            🖋
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-ink-400">
              Ledger Instructor Remarks:
            </span>
            <p className="font-hand text-lg text-ink-900 dark:text-ink-100 leading-snug mt-0.5">
              "By simulating high-ticket purchases in the What-If sandbox before paying, you protected your daily allowance from catastrophic overdraft. You graduate Month 1 with honor!"
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-paper-border dark:border-ink-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={resetToDemo}
            className="text-xs text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Ledger to Day 12 Demo State
          </button>

          <span className="font-mono text-[11px] text-ink-400">
            Inkwell Folio Certified · Pure Pure Unit-Tested Engine
          </span>
        </div>
      </div>
    </div>
  );
}
