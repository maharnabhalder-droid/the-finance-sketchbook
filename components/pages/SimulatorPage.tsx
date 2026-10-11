"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Zap,
  Split,
  Calendar,
  X,
} from "lucide-react";
import { DayState, SimulationDecision } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface SimulatorPageProps {
  dayState: DayState;
}

const TEMPLATE_DECISIONS: {
  title: string;
  type: SimulationDecision["type"];
  amount: number;
  description: string;
}[] = [
  {
    title: "Weekend Party & Drinks Split",
    type: "one_off_purchase",
    amount: 1400,
    description: "Friday night rooftop dinner with college squad.",
  },
  {
    title: "New Sneakers on Myntra Sale",
    type: "one_off_purchase",
    amount: 2200,
    description: "50% off clearance impulse purchase.",
  },
  {
    title: "Switch Swiggy 4x/wk to Mess Food (Save ₹1,200)",
    type: "habit_change",
    amount: -1200,
    description: "Cook simple meals in hostel pantry instead of ordering.",
  },
  {
    title: "Switch Cab Commute to Metro (Save ₹650)",
    type: "habit_change",
    amount: -650,
    description: "Use metro smartcard exclusively instead of Uber/Rapido.",
  },
  {
    title: "Freelance UI Illustration Payout",
    type: "side_income",
    amount: 1200,
    description: "Accept quick logo & icon commission.",
  },
  {
    title: "Gym Membership Student Pass",
    type: "new_subscription",
    amount: 799,
    description: "Monthly recurring fitness club membership.",
  },
  {
    title: "Emergency Laptop Repair Test",
    type: "unexpected_expense",
    amount: 1500,
    description: "Simulate worst-case screen replacement.",
  },
];

export function SimulatorPage({ dayState }: SimulatorPageProps) {
  const activeDecisions = useFinanceStore((state) => state.activeSimulationDecisions);
  const addSimulationDecision = useFinanceStore((state) => state.addSimulationDecision);
  const removeSimulationDecision = useFinanceStore((state) => state.removeSimulationDecision);
  const clearSimulationDecisions = useFinanceStore((state) => state.clearSimulationDecisions);
  const commitActiveSimulation = useFinanceStore((state) => state.commitActiveSimulation);
  const getSimulationDiff = useFinanceStore((state) => state.getSimulationDiff);

  const [undoToast, setUndoToast] = useState<{ undo: () => void } | null>(null);

  // Compute live ripple diff
  const diff = getSimulationDiff();
  const { before, after, deltas, verdict } = diff;

  const [customTitle, setCustomTitle] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customType, setCustomType] = useState<SimulationDecision["type"]>("one_off_purchase");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(customAmount) || 0;
    if (!customTitle.trim() || amt === 0) return;

    addSimulationDecision({
      title: customTitle.trim(),
      amount: amt,
      type: customType,
    });

    setCustomTitle("");
    setCustomAmount("");
  };

  const handleCommit = () => {
    const { undo } = commitActiveSimulation();
    setUndoToast({ undo });
    setTimeout(() => {
      setUndoToast(null);
    }, 8000);
  };

  return (
    <div className="space-y-6">
      {/* Undo Toast Notification */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3.5 rounded-xl bg-ink-900 text-white shadow-xl flex items-center justify-between border border-brass/50 text-xs font-mono"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-light" />
              <span>Decisions committed to your live notebook ledger!</span>
            </div>
            <button
              onClick={() => {
                undoToast.undo();
                setUndoToast(null);
              }}
              className="px-3 py-1 bg-brass hover:bg-brass-dark text-white rounded font-bold transition-colors ml-4"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Sandbox Header */}
      <div className="p-4 rounded-xl border border-brass/30 bg-gradient-to-r from-brass/10 via-parchment-100 to-transparent dark:from-brass/20 dark:via-ink-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brass text-white">
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
                The "What If?" Decision Sandbox
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-300">
                Stack hypothetical splurges, gig payouts, or habit cuts to see the exact ripple on your runway.
              </p>
            </div>
          </div>

          {activeDecisions.length > 0 && (
            <button
              onClick={clearSimulationDecisions}
              className="text-xs font-mono text-vermilion hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Stack ({activeDecisions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Comparison Page: "NOW" vs "IF I DO THIS" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN: REALITY (NOW) */}
        <div className="p-4 rounded-xl bg-parchment-100/70 dark:bg-ink-800/40 border border-paper-border dark:border-ink-700/80">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-ink-400 block mb-2">
            Current Reality (Now)
          </span>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-2 rounded bg-white dark:bg-ink-900/80">
              <span className="text-ink-500">Remaining Balance:</span>
              <strong className="text-ink-900 dark:text-ink-50">
                {formatINR(before.remainingBalance)}
              </strong>
            </div>
            <div className="flex justify-between p-2 rounded bg-white dark:bg-ink-900/80">
              <span className="text-ink-500">Safe Daily Allowance:</span>
              <strong className="text-brass">
                {formatINR(before.safeDailyAllowance)}/day
              </strong>
            </div>
            <div className="flex justify-between p-2 rounded bg-white dark:bg-ink-900/80">
              <span className="text-ink-500">Runway to Zero:</span>
              <strong className="text-ink-900 dark:text-ink-50">
                {before.runwayDays} days
              </strong>
            </div>
            <div className="flex justify-between p-2 rounded bg-white dark:bg-ink-900/80">
              <span className="text-ink-500">Risk Seal:</span>
              <span className="font-bold uppercase text-ink-900 dark:text-ink-50">
                {before.risk.level} ({before.risk.score}/100)
              </span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white dark:bg-ink-900/80">
              <span className="text-ink-500">Day 30 Projected Balance:</span>
              <strong className="text-ink-900 dark:text-ink-50">
                {formatINR(before.projectedDay30Balance)}
              </strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATED OUTCOME */}
        <div className="p-4 rounded-xl bg-white dark:bg-ink-900 border-2 border-brass/50 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-brass flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              If You Commit This Stack
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brass/10 text-brass font-bold">
              {activeDecisions.length} Decision{activeDecisions.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {/* Balance */}
            <div className="flex justify-between p-2 rounded bg-parchment-50 dark:bg-ink-800/60">
              <span className="text-ink-500">Simulated Balance:</span>
              <div className="flex items-center gap-2">
                <strong
                  className={
                    after.remainingBalance < 0
                      ? "text-vermilion"
                      : "text-ink-900 dark:text-ink-50"
                  }
                >
                  {formatINR(after.remainingBalance)}
                </strong>
                {deltas.remainingBalance !== 0 && (
                  <span
                    className={`text-[10px] ${
                      deltas.remainingBalance > 0 ? "text-sage-dark dark:text-sage" : "text-vermilion"
                    }`}
                  >
                    ({deltas.remainingBalance > 0 ? "+" : ""}
                    {formatINR(deltas.remainingBalance)})
                  </span>
                )}
              </div>
            </div>

            {/* Allowance */}
            <div className="flex justify-between p-2 rounded bg-parchment-50 dark:bg-ink-800/60">
              <span className="text-ink-500">Simulated Allowance:</span>
              <div className="flex items-center gap-2">
                <strong className="text-brass">
                  {formatINR(after.safeDailyAllowance)}/day
                </strong>
                {deltas.safeDailyAllowance !== 0 && (
                  <span
                    className={`text-[10px] font-bold ${
                      deltas.safeDailyAllowance > 0 ? "text-sage-dark dark:text-sage" : "text-vermilion"
                    }`}
                  >
                    ({deltas.safeDailyAllowance > 0 ? "+" : ""}
                    {formatINR(deltas.safeDailyAllowance)})
                  </span>
                )}
              </div>
            </div>

            {/* Runway */}
            <div className="flex justify-between p-2 rounded bg-parchment-50 dark:bg-ink-800/60">
              <span className="text-ink-500">Simulated Runway:</span>
              <div className="flex items-center gap-2">
                <strong className="text-ink-900 dark:text-ink-50">
                  {after.runwayDays} days
                </strong>
                {deltas.runwayDays !== 0 && (
                  <span
                    className={`text-[10px] ${
                      deltas.runwayDays > 0 ? "text-sage-dark dark:text-sage" : "text-vermilion"
                    }`}
                  >
                    ({deltas.runwayDays > 0 ? "+" : ""}
                    {deltas.runwayDays}d)
                  </span>
                )}
              </div>
            </div>

            {/* Risk Seal */}
            <div className="flex justify-between p-2 rounded bg-parchment-50 dark:bg-ink-800/60">
              <span className="text-ink-500">Simulated Risk:</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold uppercase ${
                    after.risk.level === "Danger"
                      ? "text-vermilion"
                      : after.risk.level === "Watch"
                      ? "text-saffron-dark dark:text-saffron"
                      : "text-sage-dark dark:text-sage"
                  }`}
                >
                  {after.risk.level} ({after.risk.score}/100)
                </span>
              </div>
            </div>

            {/* Day 30 Projected Balance */}
            <div className="flex justify-between p-2 rounded bg-parchment-50 dark:bg-ink-800/60">
              <span className="text-ink-500">Day 30 Forecast:</span>
              <strong className="text-ink-900 dark:text-ink-50">
                {formatINR(after.projectedDay30Balance)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Plain-Language Verdict Banner */}
      <div
        className={`p-4 rounded-xl border text-xs leading-relaxed ${
          verdict.sentiment === "danger"
            ? "bg-vermilion-light/50 border-vermilion text-vermilion-dark dark:bg-vermilion-dark/20 dark:text-vermilion-light"
            : verdict.sentiment === "warning"
            ? "bg-saffron-light/50 border-saffron text-saffron-dark dark:bg-saffron-dark/20 dark:text-saffron-light"
            : verdict.sentiment === "positive"
            ? "bg-sage-light/50 border-sage text-sage-dark dark:bg-sage-dark/20 dark:text-sage-light"
            : "bg-parchment-100 border-paper-border text-ink-800 dark:bg-ink-800 dark:text-ink-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="w-4 h-4 shrink-0" />
          <h4 className="font-serif font-bold text-sm">
            Verdict: {verdict.headline}
          </h4>
        </div>
        <p className="mb-3 text-[11px]">{verdict.description}</p>

        {/* Trade-offs list */}
        <div className="space-y-1 pt-2 border-t border-black/10 dark:border-white/10 font-mono text-[11px]">
          <span className="font-bold uppercase text-[10px] tracking-wider block">
            Observed Trade-offs:
          </span>
          {verdict.tradeOffs.map((to, i) => (
            <p key={i}>• {to}</p>
          ))}
        </div>
      </div>

      {/* Action Buttons: Commit Decision or Alternative */}
      {activeDecisions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-brass/10 dark:bg-brass/15 rounded-xl border border-brass/30">
          <div>
            <h5 className="font-serif font-bold text-xs text-ink-900 dark:text-ink-100">
              Ready to execute this plan?
            </h5>
            <p className="text-[11px] text-ink-600 dark:text-ink-400">
              Applying will permanently write these entries into your ledger (with undo).
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={clearSimulationDecisions}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-paper-border dark:border-ink-700 hover:bg-black/5"
            >
              Discard
            </button>
            <button
              onClick={handleCommit}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-brass hover:bg-brass-dark text-white rounded-lg shadow-md transition-all hover:scale-105"
            >
              Commit This to Real State
            </button>
          </div>
        </div>
      )}

      {/* Decision Stack & Library Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Active Decisions In Stack */}
        <div className="sketch-card p-4">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-500 mb-3 pb-2 border-b border-paper-border dark:border-ink-800">
            Active Decisions in Stack ({activeDecisions.length})
          </h4>

          {activeDecisions.length === 0 ? (
            <p className="text-xs text-ink-400 italic py-6 text-center">
              Stack is currently empty. Tap any template on the right or type a custom decision below.
            </p>
          ) : (
            <div className="space-y-2">
              {activeDecisions.map((dec) => (
                <div
                  key={dec.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-parchment-50 dark:bg-ink-800/60 border border-paper-border dark:border-ink-700 text-xs"
                >
                  <div>
                    <span className="font-semibold text-ink-900 dark:text-ink-100 block">
                      {dec.title}
                    </span>
                    <span className="text-[10px] text-ink-400 font-mono capitalize">
                      {dec.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-bold ${
                        dec.amount > 0 ? "text-vermilion" : "text-sage-dark dark:text-sage"
                      }`}
                    >
                      {dec.amount > 0 ? "-" : "+"}
                      {formatINR(Math.abs(dec.amount))}
                    </span>
                    <button
                      onClick={() => removeSimulationDecision(dec.id)}
                      className="text-ink-400 hover:text-vermilion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Decision Input Form */}
          <form onSubmit={handleAddCustom} className="mt-4 pt-3 border-t border-paper-border dark:border-ink-800">
            <span className="text-[10px] font-mono uppercase text-ink-400 font-bold block mb-2">
              Or Test Custom Decision:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <input
                type="text"
                placeholder="e.g. Swiggy Weekend Feast"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-paper-border dark:border-ink-700 bg-white dark:bg-ink-900"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs font-mono rounded border border-paper-border dark:border-ink-700 bg-white dark:bg-ink-900"
                />
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value as any)}
                  className="w-1/2 px-2 py-1.5 text-[11px] rounded border border-paper-border dark:border-ink-700 bg-white dark:bg-ink-900"
                >
                  <option value="one_off_purchase">One-off Purchase</option>
                  <option value="habit_change">Habit Cut (Savings)</option>
                  <option value="side_income">Side Income</option>
                  <option value="new_subscription">New Subscription</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!customTitle || !customAmount}
                className="w-full py-1.5 text-xs font-bold bg-brass/15 hover:bg-brass/25 text-brass rounded transition-colors disabled:opacity-40"
              >
                + Add Custom to Stack
              </button>
            </div>
          </form>
        </div>

        {/* Quick Decision Templates Library */}
        <div className="sketch-card p-4">
          <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-ink-500 mb-3 pb-2 border-b border-paper-border dark:border-ink-800">
            Quick Gen Z Scenarios to Try
          </h4>

          <div className="space-y-2">
            {TEMPLATE_DECISIONS.map((t, idx) => (
              <button
                key={idx}
                onClick={() =>
                  addSimulationDecision({
                    title: t.title,
                    type: t.type,
                    amount: t.amount,
                  })
                }
                className="w-full text-left p-2.5 rounded-lg border border-paper-border/80 dark:border-ink-700/60 hover:border-brass bg-parchment-50/50 dark:bg-ink-800/40 hover:bg-white dark:hover:bg-ink-800 transition-all group flex items-start justify-between"
              >
                <div>
                  <span className="font-semibold text-xs text-ink-900 dark:text-ink-100 group-hover:text-brass transition-colors block">
                    {t.title}
                  </span>
                  <p className="text-[10px] text-ink-500">{t.description}</p>
                </div>
                <span
                  className={`font-mono text-xs font-bold shrink-0 ml-2 ${
                    t.amount > 0 ? "text-vermilion" : "text-sage-dark dark:text-sage"
                  }`}
                >
                  {t.amount > 0 ? `+₹${t.amount}` : `-₹${Math.abs(t.amount)}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
