"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  TrendingDown,
  TrendingUp,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DayState, UnexpectedEvent } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface ForecastRiskPageProps {
  dayState: DayState;
}

export function ForecastRiskPage({ dayState }: ForecastRiskPageProps) {
  const currentDay = useFinanceStore((state) => state.currentDay);
  const unexpectedEvents = useFinanceStore((state) => state.unexpectedEvents);
  const resolveUnexpectedEvent = useFinanceStore((state) => state.resolveUnexpectedEvent);
  const addSimulationDecision = useFinanceStore((state) => state.addSimulationDecision);
  const setActivePage = useFinanceStore((state) => state.setActivePage);

  const [stressSuccessMsg, setStressSuccessMsg] = useState<string | null>(null);

  // Map forecastPoints to chart-friendly format
  const chartData = dayState.forecastPoints.map((pt) => ({
    day: `D${pt.day}`,
    dayNum: pt.day,
    actual: pt.actualBalance !== undefined ? Math.round(pt.actualBalance) : null,
    expected: Math.round(pt.expectedBalance),
    best: Math.round(pt.bestCaseBalance),
    worst: Math.round(pt.worstCaseBalance),
    isPast: pt.day <= currentDay,
  }));

  const pendingEvents = unexpectedEvents.filter((e) => !e.resolved);

  // Quick Stress Test Pre-sets that feed into the Decision Simulator
  const stressPresets = [
    {
      title: "Broken Screen Panic",
      amount: 1800,
      desc: "Phone slips on train platform (₹1,800 display repair)",
    },
    {
      title: "Late Lab Equipment Fee",
      amount: 1200,
      desc: "Emergency lab component replacement (₹1,200)",
    },
    {
      title: "Friend's Impromptu B'day",
      amount: 600,
      desc: "Group dinner split contribution (₹600)",
    },
    {
      title: "Medical Checkup & Meds",
      amount: 950,
      desc: "Sudden seasonal illness clinic prescription (₹950)",
    },
  ];

  const handleInjectStressToSimulator = (title: string, amount: number) => {
    addSimulationDecision({
      type: "unexpected_expense",
      title,
      amount,
    });
    setStressSuccessMsg(`Added "${title}" (₹${formatINR(amount)}) to Simulator!`);
    setTimeout(() => setStressSuccessMsg(null), 3000);
  };

  const riskBadgeClass =
    dayState.risk.level === "Danger"
      ? "bg-vermilion/15 text-vermilion border-vermilion/30"
      : dayState.risk.level === "Watch"
      ? "bg-saffron/15 text-saffron border-saffron/30"
      : "bg-sage/15 text-sage-dark dark:text-sage-light border-sage/30";

  return (
    <div className="space-y-6">
      {/* Chapter Subheading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border dark:border-ink-800 pb-3">
        <div>
          <span className="font-hand text-lg text-ink-500 block -mb-1">
            "The Future is a Probability Fan..."
          </span>
          <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
            30-Day Cash Runway Forecast & Risk Decomposition
          </h3>
        </div>

        <div
          className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold flex items-center gap-2 self-start sm:self-auto ${riskBadgeClass}`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>
            Risk Index: {dayState.risk.score}/100 ({dayState.risk.level})
          </span>
        </div>
      </div>

      {/* Main 3-Cone Forecast Chart */}
      <div
        className="p-5 rounded-2xl bg-parchment-50/70 dark:bg-ink-950/60 border border-paper-border dark:border-ink-700/80 shadow-sm"
        data-lens-title="3-Cone Monthly Forecast"
        data-lens-formula="Balance - (Weighted Daily Spend × Days Left) - Fixed Dues"
        data-lens-value={`Expected Day 30: ₹${formatINR(dayState.projectedDay30Balance)}`}
        data-lens-explanation="The shaded area plots 3 futures: Best (30% tighter spend), Expected (recency-weighted pace), and Worst (unplanned spikes). Notice where the cone drops to zero."
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="font-serif font-bold text-base text-ink-900 dark:text-ink-100">
              The 3-Path Runway Cone (Days 1 → 30)
            </h4>
            <p className="text-xs text-ink-500">
              Recency-weighted daily burn rate: ₹{formatINR(dayState.weightedAvgDailySpend)}/day.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-sage-dark dark:text-sage-light">
              <span className="w-2.5 h-2.5 rounded-sm bg-sage/60 border border-sage"></span>
              Best Case
            </span>
            <span className="flex items-center gap-1.5 text-brass">
              <span className="w-2.5 h-2.5 rounded-sm bg-brass/60 border border-brass"></span>
              Expected
            </span>
            <span className="flex items-center gap-1.5 text-vermilion">
              <span className="w-2.5 h-2.5 rounded-sm bg-vermilion/60 border border-vermilion"></span>
              Worst Case
            </span>
          </div>
        </div>

        {/* Recharts Area Container with screen-reader accessible alternative */}
        <div
          role="region"
          aria-label="30-day multi-cone runway balance forecast chart"
          tabIndex={0}
          className="h-64 sm:h-72 w-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass rounded-lg"
        >
          {/* Hidden accessible data table for screen reader users */}
          <table className="sr-only">
            <caption>Day-by-Day Balance Trajectory (Best, Expected, and Worst Cones)</caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                <th scope="col">Actual Balance</th>
                <th scope="col">Expected Forecast</th>
                <th scope="col">Best Case</th>
                <th scope="col">Worst Case</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.day}>
                  <td>Day {row.dayNum}</td>
                  <td>{row.actual !== null ? `₹${row.actual}` : "Future"}</td>
                  <td>₹{row.expected}</td>
                  <td>₹{row.best}</td>
                  <td>₹{row.worst}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c59b27" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c59b27" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastWorst" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c0392b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c0392b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                domain={[0, 11000]}
                tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + "k" : v}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700 p-2.5 rounded-lg shadow-lg text-xs font-mono">
                        <div className="font-serif font-bold text-ink-900 dark:text-ink-50 border-b pb-1 mb-1.5">
                          {label} {data.isPast ? "(Recorded)" : "(Forecast)"}
                        </div>
                        {data.actual !== null ? (
                          <div className="text-ink-900 dark:text-ink-100 font-bold">
                            Actual Cash: ₹{formatINR(data.actual)}
                          </div>
                        ) : (
                          <>
                            <div className="text-sage-dark dark:text-sage-light">
                              Best: ₹{formatINR(data.best)}
                            </div>
                            <div className="text-brass font-bold">
                              Expected: ₹{formatINR(data.expected)}
                            </div>
                            <div className="text-vermilion">
                              Worst: ₹{formatINR(data.worst)}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                x={`D${currentDay}`}
                stroke="#c59b27"
                strokeDasharray="4 4"
                label={{
                  value: `Day ${currentDay} (Today)`,
                  fill: "#c59b27",
                  fontSize: 10,
                  position: "top",
                }}
              />
              <ReferenceLine y={0} stroke="#c0392b" strokeWidth={1.5} />

              {/* Shaded Areas */}
              <Area
                type="monotone"
                dataKey="best"
                stroke="#2e7d32"
                strokeWidth={1.5}
                fill="url(#forecastBest)"
              />
              <Area
                type="monotone"
                dataKey="expected"
                stroke="#c59b27"
                strokeWidth={2}
                fill="url(#forecastExpected)"
              />
              <Area
                type="monotone"
                dataKey="worst"
                stroke="#c0392b"
                strokeWidth={1.5}
                fill="url(#forecastWorst)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Narrative Bottom Bar */}
        <div className="mt-3 pt-3 border-t border-paper-border dark:border-ink-800 flex flex-wrap items-center justify-between text-xs text-ink-500 gap-2">
          <span>
            {dayState.projectedDay30Balance > 0 ? (
              <span className="text-sage-dark dark:text-sage-light font-bold flex items-center gap-1">
                ✓ On trajectory to conclude 30 days with ~₹{formatINR(dayState.projectedDay30Balance)} unspent buffer.
              </span>
            ) : (
              <span className="text-vermilion font-bold flex items-center gap-1">
                ⚠ Deficit Warning: Zero-cash crossover projected by Day {Math.min(30, Math.round(currentDay + dayState.runwayDays))}.
              </span>
            )}
          </span>
          <span className="font-mono text-[11px]">
            Runway: <strong>{dayState.runwayDays} days</strong> vs {dayState.daysRemaining} days left
          </span>
        </div>
      </div>

      {/* Two Grid Columns: Risk Anatomy vs Stress-Test Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Risk Anatomy Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-saffron" />
              Risk Anatomy & Key Vulnerabilities
            </h4>
            <span className="font-mono text-[11px] text-ink-400">Pure Mathematical Model</span>
          </div>

          <div className="space-y-3">
            {/* Runway shortfall gauge */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600 dark:text-ink-300">Runway Sufficiency</span>
                <span className="font-mono font-bold">
                  {dayState.runwayDays >= dayState.daysRemaining
                    ? "Adequate (100%)"
                    : `${Math.round((dayState.runwayDays / Math.max(1, dayState.daysRemaining)) * 100)}% coverage`}
                </span>
              </div>
              <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dayState.runwayDays >= dayState.daysRemaining ? "bg-sage" : "bg-saffron"
                  }`}
                  style={{
                    width: `${Math.min(100, (dayState.runwayDays / Math.max(1, dayState.daysRemaining)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Fixed commitment coverage */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600 dark:text-ink-300">Commitment Coverage Ratio</span>
                <span className="font-mono font-bold">
                  {Math.round(dayState.risk.commitmentCoverageRatio * 100)}%
                </span>
              </div>
              <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brass h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, dayState.risk.commitmentCoverageRatio * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Subscription load */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-ink-600 dark:text-ink-300">Monthly Subscriptions Load</span>
                <span className="font-mono font-bold">
                  {Math.round(dayState.risk.subscriptionLoadPercent)}% of initial ₹10k
                </span>
              </div>
              <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-lavender h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, dayState.risk.subscriptionLoadPercent * 4)}%`,
                  }}
                />
              </div>
            </div>

            {/* Top Risk Trigger Bullets */}
            <div className="mt-4 pt-3 border-t border-paper-border dark:border-ink-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block mb-2">
                Top Risk Factors Identified by Engine:
              </span>
              <ul className="space-y-1.5 text-xs">
                {dayState.risk.topFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-ink-700 dark:text-ink-300">
                    <span className="text-vermilion font-bold">•</span>
                    <span>
                      <strong>{factor.title}</strong> ({factor.impact}): {factor.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stress-Testing Shock Box */}
        <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-saffron" />
                "Life Happens" Stress Injections
              </h4>
              <span className="font-hand text-sm text-saffron">Simulate before real life hits</span>
            </div>

            <p className="text-xs text-ink-500 mb-4">
              Click any shock below to push it into your Decision Simulator sandbox. Test if your allowance survives before it happens in reality:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {stressPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInjectStressToSimulator(preset.title, preset.amount)}
                  className="p-3 text-left rounded-xl border border-paper-border dark:border-ink-800 bg-parchment-50/50 dark:bg-ink-950/50 hover:border-saffron hover:bg-saffron/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-xs font-bold text-ink-900 dark:text-ink-100 block group-hover:text-saffron transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-ink-400 block line-clamp-1 mt-0.5">
                      {preset.desc}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-vermilion mt-2 block">
                    + ₹{formatINR(preset.amount)}
                  </span>
                </button>
              ))}
            </div>

            {stressSuccessMsg && (
              <div className="mt-3 p-2 rounded-lg bg-saffron/10 border border-saffron/30 text-xs font-mono text-saffron text-center animate-fade-in flex items-center justify-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{stressSuccessMsg}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-paper-border dark:border-ink-800 flex items-center justify-between">
            <span className="text-xs text-ink-400 font-mono">Ready to inspect ripple?</span>
            <button
              onClick={() => setActivePage("simulator")}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
            >
              Open Simulator Sandbox
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Unresolved Shocks in Real Ledger */}
      {pendingEvents.length > 0 && (
        <div className="p-5 rounded-2xl bg-vermilion/5 border-2 border-vermilion/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-vermilion flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Active Pending Shocks in Current Ledger ({pendingEvents.length})
            </h4>
            <span className="font-mono text-xs text-vermilion font-bold">Requires Action</span>
          </div>

          <div className="space-y-2">
            {pendingEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-white dark:bg-ink-900 border border-vermilion/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100">
                      {evt.title}
                    </span>
                    <span className="font-mono text-xs font-bold text-vermilion">
                      ₹{formatINR(evt.amount)}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/5 text-ink-500">
                      Day {evt.day}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{evt.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => resolveUnexpectedEvent(evt.id, "pay")}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Pay in Full
                  </button>
                  <button
                    onClick={() => resolveUnexpectedEvent(evt.id, "split")}
                    className="btn-secondary text-xs py-1.5 px-3"
                    title="Pay 50% now and split 50% on UPI"
                  >
                    Split 50%
                  </button>
                  <button
                    onClick={() => resolveUnexpectedEvent(evt.id, "defer")}
                    className="text-xs text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 underline px-2"
                  >
                    Defer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
