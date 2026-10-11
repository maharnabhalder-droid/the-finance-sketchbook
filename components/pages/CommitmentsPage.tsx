"use client";

import React from "react";
import {
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { DayState } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface CommitmentsPageProps {
  dayState: DayState;
}

export function CommitmentsPage({ dayState }: CommitmentsPageProps) {
  const commitments = useFinanceStore((state) => state.commitments);
  const subscriptions = useFinanceStore((state) => state.subscriptions);
  const toggleCommitmentPaid = useFinanceStore((state) => state.toggleCommitmentPaid);
  const toggleSubscriptionActive = useFinanceStore((state) => state.toggleSubscriptionActive);

  const activeSubs = subscriptions.filter((s) => s.active);
  const totalSubMonthly = activeSubs.reduce((sum, s) => sum + s.price, 0);
  const subPercentOfBudget = Math.round((totalSubMonthly / dayState.startBudget) * 1000) / 10;

  return (
    <div className="space-y-6">
      {/* Subscription Creep Warning Header */}
      <div className="p-4 rounded-xl border border-paper-border dark:border-ink-800 bg-parchment-50 dark:bg-ink-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-brass tracking-wider block mb-0.5">
            Recurring Overhead
          </span>
          <h3 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
            {activeSubs.length} Active Subscriptions · {formatINR(totalSubMonthly)} / month
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5">
            Consumes <strong>{subPercentOfBudget}%</strong> of your ₹10,000 allowance. That's about{" "}
            <strong>{formatINR(Math.round(totalSubMonthly / 30))}/day</strong> silently leaking every 24 hours.
          </p>
        </div>

        {subPercentOfBudget > 5 && (
          <div className="px-3 py-1.5 rounded-lg bg-saffron-light dark:bg-saffron-dark/30 text-saffron-dark dark:text-saffron-light border border-saffron/30 text-xs font-semibold shrink-0 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Subscription Creep Warning</span>
          </div>
        )}
      </div>

      {/* Grid: Fixed Dues vs Recurring Subscriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 1: Non-negotiable Fixed Commitments */}
        <div className="sketch-card p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-border dark:border-ink-800">
            <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brass" />
              Fixed Dues (Tuition, Metro, Wi-Fi)
            </h4>
            <span className="text-xs font-mono font-bold text-ink-400">
              Unpaid: {formatINR(dayState.unpaidCommitmentsTotal)}
            </span>
          </div>

          <div className="space-y-3">
            {commitments.map((c) => {
              const isPast = c.dueDay < dayState.currentDay;
              const isDueToday = c.dueDay === dayState.currentDay;

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border transition-all ${
                    c.isPaid
                      ? "bg-sage-light/30 dark:bg-sage-dark/10 border-sage/30 opacity-75"
                      : isDueToday
                      ? "bg-saffron-light/40 dark:bg-saffron-dark/20 border-saffron"
                      : "bg-white dark:bg-ink-800/50 border-paper-border dark:border-ink-700"
                  }`}
                  data-lens-title={`Commitment: ${c.name}`}
                  data-lens-formula={`Amount = ${formatINR(c.amount)} due Day ${c.dueDay}`}
                  data-lens-value={c.isPaid ? "PAID" : `DUE DAY ${c.dueDay}`}
                  data-lens-explanation={c.notes || "Essential fixed commitment."}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="font-semibold text-xs text-ink-900 dark:text-ink-100 block">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-ink-500 font-mono">
                        {c.category} · Due Day {c.dueDay}
                        {c.dueDay >= dayState.currentDay &&
                          ` (${c.dueDay - dayState.currentDay} days left)`}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-ink-900 dark:text-ink-50">
                      {formatINR(c.amount)}
                    </span>
                  </div>

                  {c.notes && (
                    <p className="text-[11px] text-ink-500 italic mb-2 line-clamp-1">
                      "{c.notes}"
                    </p>
                  )}

                  {/* Mark as paid button */}
                  <button
                    onClick={() => toggleCommitmentPaid(c.id)}
                    className={`w-full py-1 px-2.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 ${
                      c.isPaid
                        ? "bg-sage/10 text-sage-dark dark:text-sage hover:bg-sage/20"
                        : "bg-brass text-white hover:bg-brass-dark"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{c.isPaid ? "Paid via UPI (Click to undo)" : "Mark as Paid"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Subscriptions (Streaming, Music, Cloud) */}
        <div className="sketch-card p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-paper-border dark:border-ink-800">
            <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brass" />
              Active Subscriptions
            </h4>
            <span className="text-xs font-mono font-bold text-ink-400">
              Total: {formatINR(totalSubMonthly)}/mo
            </span>
          </div>

          <div className="space-y-3">
            {subscriptions.map((s) => (
              <div
                key={s.id}
                className={`p-3 rounded-xl border transition-all ${
                  s.active
                    ? "bg-white dark:bg-ink-800/50 border-paper-border dark:border-ink-700"
                    : "bg-black/5 dark:bg-white/5 border-dashed border-paper-border dark:border-ink-800 opacity-60"
                }`}
                data-lens-title={`Subscription: ${s.name}`}
                data-lens-formula={`${formatINR(s.price)}/mo = ₹${Math.round(s.price / 30)}/day`}
                data-lens-value={s.active ? "ACTIVE" : "PAUSED"}
                data-lens-explanation={`Renews on Day ${s.dueDay}. Cancellation difficulty: ${s.cancellationDifficulty || "easy"}.`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className="font-semibold text-xs text-ink-900 dark:text-ink-100 block">
                      {s.name}
                    </span>
                    <span className="text-[10px] text-ink-500 font-mono">
                      Renews Day {s.dueDay} · {s.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-ink-900 dark:text-ink-50 block">
                      {formatINR(s.price)}
                    </span>
                    <span className="text-[10px] text-ink-400 font-mono">
                      ₹{Math.round(s.price / 30)}/day
                    </span>
                  </div>
                </div>

                {/* Pause / Resume action */}
                <div className="flex items-center justify-between pt-1 border-t border-paper-border/60 dark:border-ink-800">
                  <span className="text-[10px] font-mono text-ink-400">
                    Difficulty: <strong className="capitalize">{s.cancellationDifficulty}</strong>
                  </span>
                  <button
                    onClick={() => toggleSubscriptionActive(s.id)}
                    className={`text-xs font-bold font-mono px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                      s.active
                        ? "text-vermilion hover:bg-vermilion/10"
                        : "text-sage-dark dark:text-sage hover:bg-sage/10"
                    }`}
                  >
                    {s.active ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" /> Pause Sub
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" /> Resume Sub
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
