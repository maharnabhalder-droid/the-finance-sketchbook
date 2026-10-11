"use client";

import React from "react";
import {
  TrendingDown,
  Calendar,
  AlertCircle,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DayState } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface OverviewPageProps {
  dayState: DayState;
}

export function OverviewPage({ dayState }: OverviewPageProps) {
  const transactions = useFinanceStore((state) => state.transactions);
  const commitments = useFinanceStore((state) => state.commitments);
  const subscriptions = useFinanceStore((state) => state.subscriptions);
  const unexpectedEvents = useFinanceStore((state) => state.unexpectedEvents);
  const setActivePage = useFinanceStore((state) => state.setActivePage);
  const resolveUnexpectedEvent = useFinanceStore((state) => state.resolveUnexpectedEvent);

  // Filter recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Filter upcoming dues within next 7 days
  const upcomingCommitments = commitments.filter(
    (c) => !c.isPaid && c.dueDay >= dayState.currentDay && c.dueDay <= dayState.currentDay + 7
  );

  const upcomingSubscriptions = subscriptions.filter(
    (s) => s.active && s.dueDay >= dayState.currentDay && s.dueDay <= dayState.currentDay + 7
  );

  // Unresolved emergencies
  const pendingEmergencies = unexpectedEvents.filter(
    (e) => !e.resolved && e.day <= dayState.currentDay
  );

  return (
    <div className="space-y-6">
      {/* "Life Happens" Emergency Alert Banner if any pending */}
      {pendingEmergencies.length > 0 && (
        <div className="p-4 rounded-xl border-2 border-vermilion/40 bg-vermilion-light/50 dark:bg-vermilion-dark/20 text-vermilion-dark dark:text-vermilion-light animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-vermilion" />
              <div>
                <span className="text-xs uppercase font-bold tracking-wider font-mono">
                  Life Happens! Urgent Event Pending:
                </span>
                <h4 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
                  {pendingEmergencies[0].title} ({formatINR(pendingEmergencies[0].amount)})
                </h4>
                <p className="text-xs text-ink-700 dark:text-ink-300 mt-0.5">
                  {pendingEmergencies[0].description}
                </p>
              </div>
            </div>

            {/* Quick response buttons */}
            <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
              <button
                onClick={() => resolveUnexpectedEvent(pendingEmergencies[0].id, "pay")}
                className="px-3 py-1.5 text-xs font-bold bg-vermilion text-white rounded-lg hover:bg-vermilion-dark transition-colors shadow-sm"
              >
                Pay Full ({formatINR(pendingEmergencies[0].amount)})
              </button>
              <button
                onClick={() => resolveUnexpectedEvent(pendingEmergencies[0].id, "split")}
                className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-vermilion/30 rounded-lg hover:bg-vermilion/10 transition-colors"
              >
                Split 50% UPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Hook Banner */}
      <div className="p-4 rounded-xl border border-brass/30 bg-gradient-to-r from-brass/10 via-parchment-100 to-transparent dark:from-brass/20 dark:via-ink-800/40 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-brass tracking-wider block">
            Featured Sandbox Tool
          </span>
          <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-50">
            Simulate decisions before spending a single rupee
          </h4>
          <p className="text-xs text-ink-600 dark:text-ink-300">
            Test a weekend party, new subscription, or habit change to preview the exact ripple on your runway.
          </p>
        </div>
        <button
          onClick={() => setActivePage("simulator")}
          className="px-3.5 py-2 text-xs font-bold bg-brass text-white rounded-lg hover:bg-brass-dark transition-all flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Open Simulator</span>
        </button>
      </div>

      {/* Grid: Upcoming Fixed Dues & Recent Ledger Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Upcoming Bills in next 7 days */}
        <div className="sketch-card p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-paper-border dark:border-ink-800">
            <span className="text-xs font-serif font-bold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brass" />
              Fixed Bills Due (Days {dayState.currentDay}–{dayState.currentDay + 7})
            </span>
            <button
              onClick={() => setActivePage("commitments")}
              className="text-[11px] font-mono text-brass hover:underline flex items-center gap-0.5"
            >
              All Dues <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {upcomingCommitments.length === 0 && upcomingSubscriptions.length === 0 ? (
            <p className="text-xs text-ink-400 italic py-4 text-center">
              No bills due this week. Your runway is clear of upcoming fixed debits!
            </p>
          ) : (
            <div className="space-y-2.5">
              {upcomingCommitments.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-parchment-50 dark:bg-ink-800/50 border border-paper-border/60 dark:border-ink-700/60 text-xs"
                >
                  <div>
                    <span className="font-semibold text-ink-900 dark:text-ink-100 block">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-ink-400 font-mono">
                      Due Day {c.dueDay} ({c.dueDay - dayState.currentDay} days away)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-ink-900 dark:text-ink-100">
                    {formatINR(c.amount)}
                  </span>
                </div>
              ))}

              {upcomingSubscriptions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-parchment-50 dark:bg-ink-800/50 border border-paper-border/60 dark:border-ink-700/60 text-xs"
                >
                  <div>
                    <span className="font-semibold text-ink-900 dark:text-ink-100 block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-ink-400 font-mono">
                      Auto-renews Day {s.dueDay}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-ink-900 dark:text-ink-100">
                    {formatINR(s.price)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Ledger Transactions */}
        <div className="sketch-card p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-paper-border dark:border-ink-800">
            <span className="text-xs font-serif font-bold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brass" />
              Latest Ledger Entries
            </span>
            <button
              onClick={() => setActivePage("spending")}
              className="text-[11px] font-mono text-brass hover:underline flex items-center gap-0.5"
            >
              Full Log <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-ink-900 dark:text-ink-100 truncate max-w-[170px]">
                      {tx.title}
                    </span>
                    {tx.sentiment === "worth_it" && (
                      <span className="text-[10px] text-sage-dark dark:text-sage-light" title="Worth it">✨</span>
                    )}
                    {tx.sentiment === "regret" && (
                      <span className="text-[10px] text-vermilion" title="Regret">💔</span>
                    )}
                  </div>
                  <span className="text-[10px] text-ink-400 font-mono">
                    Day {tx.day} · {tx.category}
                  </span>
                </div>
                <span className="font-mono font-bold text-ink-900 dark:text-ink-100">
                  -{formatINR(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 30-Day Budget Rule Snapshot */}
      <div className="p-4 rounded-xl bg-parchment-100 dark:bg-ink-800/40 border border-paper-border dark:border-ink-800">
        <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-500 mb-2">
          The 30-Day Golden Rule:
        </h4>
        <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed font-sans">
          Your starting budget was <strong>₹10,000</strong>. You have spent{" "}
          <strong>{formatINR(dayState.totalSpent)}</strong> across 12 days (averaging{" "}
          <strong>{formatINR(dayState.weightedAvgDailySpend)}/day</strong>). By safeguarding your{" "}
          <strong>{formatINR(dayState.totalReserved)}</strong> reserved dues, you can safely spend up to{" "}
          <strong className="text-brass">{formatINR(dayState.safeDailyAllowance)}/day</strong> every day until Day 30 without running out of money.
        </p>
      </div>
    </div>
  );
}
