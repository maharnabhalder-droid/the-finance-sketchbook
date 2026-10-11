"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
} from "lucide-react";
import { useFinanceStore, LedgerPageId } from "../lib/store/useFinanceStore";
import { formatINR } from "../lib/engine/finance";
import { WaxSealStamp } from "./WaxSealStamp";
import { MarginNote } from "./MarginNote";

import dynamic from "next/dynamic";

// Initial page is kept eager for instant LCP on Chapter 01
import { OverviewPage } from "./pages/OverviewPage";

// Skeleton fallback to prevent layout shifts (CLS < 0.05)
const PageSkeleton = () => (
  <div className="space-y-4 animate-pulse p-4" aria-busy="true" aria-label="Loading page chapter">
    <div className="h-7 bg-paper-border/40 dark:bg-ink-800 rounded-lg w-1/3" />
    <div className="h-4 bg-paper-border/30 dark:bg-ink-800/60 rounded w-1/2" />
    <div className="h-44 bg-paper-border/20 dark:bg-ink-800/40 rounded-xl" />
    <div className="grid grid-cols-2 gap-3 pt-2">
      <div className="h-28 bg-paper-border/20 dark:bg-ink-800/40 rounded-xl" />
      <div className="h-28 bg-paper-border/20 dark:bg-ink-800/40 rounded-xl" />
    </div>
  </div>
);

// Heavy non-initial modules loaded lazily on demand
const SpendingPage = dynamic(
  () => import("./pages/SpendingPage").then((mod) => mod.SpendingPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const CommitmentsPage = dynamic(
  () => import("./pages/CommitmentsPage").then((mod) => mod.CommitmentsPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const GoalsPage = dynamic(
  () => import("./pages/GoalsPage").then((mod) => mod.GoalsPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const SimulatorPage = dynamic(
  () => import("./pages/SimulatorPage").then((mod) => mod.SimulatorPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const ForecastRiskPage = dynamic(
  () => import("./pages/ForecastRiskPage").then((mod) => mod.ForecastRiskPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const HealthInsightsPage = dynamic(
  () => import("./pages/HealthInsightsPage").then((mod) => mod.HealthInsightsPage),
  { loading: () => <PageSkeleton />, ssr: false }
);
const MonthEndReportCard = dynamic(
  () => import("./pages/MonthEndReportCard").then((mod) => mod.MonthEndReportCard),
  { loading: () => <PageSkeleton />, ssr: false }
);

const PAGES_ORDER: { id: LedgerPageId; title: string; chapter: string }[] = [
  { id: "overview", title: "Daily Ledger & Cashflow", chapter: "01" },
  { id: "spending", title: "Spending & Habits", chapter: "02" },
  { id: "commitments", title: "Fixed Dues & Subscriptions", chapter: "03" },
  { id: "goals", title: "Savings Goals & Desires", chapter: "04" },
  { id: "simulator", title: "Decision Simulator Sandbox", chapter: "05" },
  { id: "forecast", title: "Forecast & Risk Analysis", chapter: "06" },
  { id: "health", title: "Health & Habit Insights", chapter: "07" },
  { id: "report", title: "Month-End Report Card", chapter: "08" },
];

export function TheLedgerBook() {
  const activePage = useFinanceStore((state) => state.activePage);
  const setActivePage = useFinanceStore((state) => state.setActivePage);
  const getDayState = useFinanceStore((state) => state.getDayState);
  const reducedMotion = useFinanceStore((state) => state.reducedMotion);

  const dayState = getDayState();
  const currentIndex = PAGES_ORDER.findIndex((p) => p.id === activePage);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActivePage(PAGES_ORDER[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < PAGES_ORDER.length - 1) {
      setActivePage(PAGES_ORDER[currentIndex + 1].id);
    }
  };

  // Render Right Page Component based on activePage
  const renderRightPageContent = () => {
    switch (activePage) {
      case "overview":
        return <OverviewPage dayState={dayState} />;
      case "spending":
        return <SpendingPage dayState={dayState} />;
      case "commitments":
        return <CommitmentsPage dayState={dayState} />;
      case "goals":
        return <GoalsPage dayState={dayState} />;
      case "simulator":
        return <SimulatorPage dayState={dayState} />;
      case "forecast":
        return <ForecastRiskPage dayState={dayState} />;
      case "health":
        return <HealthInsightsPage dayState={dayState} />;
      case "report":
        return <MonthEndReportCard dayState={dayState} />;
      default:
        return <OverviewPage dayState={dayState} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-8">
      {/* 3D Open Ledger Book Wrapper */}
      <div className="relative rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-[#e8dec9] to-[#d8cbbb] dark:from-[#151c2e] dark:to-[#0d1220] shadow-2xl border border-black/10 dark:border-white/5">
        {/* Book Ribbon Bookmarks & Bookmark tabs on top */}
        <div className="hidden md:flex justify-end gap-1.5 px-6 -mt-7 mb-2 overflow-x-auto">
          {PAGES_ORDER.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setActivePage(p.id)}
              className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-t-lg transition-all border-t border-x ${
                activePage === p.id
                  ? "bg-white dark:bg-ink-900 text-brass font-bold border-paper-border dark:border-ink-700 shadow-sm translate-y-0.5"
                  : "bg-parchment-200/80 dark:bg-ink-950/80 text-ink-500 border-black/5 dark:border-white/5 hover:text-ink-800 dark:hover:text-ink-200"
              }`}
            >
              {p.chapter} {p.title.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* The Two Open Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl overflow-hidden bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-800 shadow-sketchbook dark:shadow-sketchbook-dark">
          {/* ================================================================= */}
          {/* LEFT PAGE: "TODAY" EXECUTIVE HUD & VITAL SIGNS (lg:col-span-4)   */}
          {/* ================================================================= */}
          <div className="lg:col-span-4 p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-paper-border/80 dark:border-ink-800/80 bg-parchment-50/50 dark:bg-ink-950/50 flex flex-col justify-between relative">
            {/* Book Spine Shadow Accent */}
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />

            <div>
              {/* Header: Date & Page notation */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-paper-border dark:border-ink-800">
                <span className="font-mono text-xs font-bold text-brass uppercase tracking-widest">
                  Day {dayState.currentDay} of {dayState.totalDays}
                </span>
                <span className="text-[11px] font-mono text-ink-400">
                  {dayState.daysRemaining} days left in cycle
                </span>
              </div>

              {/* Main Allowance Card */}
              <div
                className="mb-5 p-4 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm relative overflow-hidden"
                data-lens-title="Safe Daily Allowance"
                data-lens-formula="(Remaining Balance - Total Reserved) ÷ Days Remaining"
                data-lens-value={`${formatINR(dayState.safeDailyAllowance)}/day`}
                data-lens-explanation="Your real disposable ceiling for today. Spend less than this and your runway extends; spend more and your allowance for tomorrow drops."
              >
                <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-ink-400 block mb-1">
                  Safe Daily Allowance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-3xl sm:text-4xl text-ink-900 dark:text-ink-50">
                    {formatINR(dayState.safeDailyAllowance)}
                  </span>
                  <span className="text-xs text-ink-400 font-mono">/ day</span>
                </div>

                {/* Delta vs Yesterday */}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-mono">
                  {dayState.allowanceDelta >= 0 ? (
                    <span className="text-sage-dark dark:text-sage-light font-bold flex items-center">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      +{formatINR(dayState.allowanceDelta)} vs yesterday
                    </span>
                  ) : (
                    <span className="text-vermilion-dark dark:text-vermilion-light font-bold flex items-center">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      {formatINR(dayState.allowanceDelta)} vs yesterday
                    </span>
                  )}
                  <span className="text-ink-400 text-[10px]">· dynamic</span>
                </div>
              </div>

              {/* Secondary Balance & Runway Row */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Remaining Balance */}
                <div
                  className="p-3.5 rounded-xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm"
                  data-lens-title="Remaining Cash Balance"
                  data-lens-formula="Start Budget (₹10k) + Income - All Spends - Paid Bills - Saved"
                  data-lens-value={formatINR(dayState.remainingBalance)}
                  data-lens-explanation="Total unspent rupees currently in your wallet and bank accounts."
                >
                  <span className="text-[10px] uppercase font-mono font-bold text-ink-400 block mb-1">
                    Cash Balance
                  </span>
                  <span
                    className={`font-serif font-bold text-xl block ${
                      dayState.isOverdraft
                        ? "text-vermilion"
                        : "text-ink-900 dark:text-ink-50"
                    }`}
                  >
                    {formatINR(dayState.remainingBalance)}
                  </span>
                  {dayState.isOverdraft && (
                    <span className="text-[10px] font-bold text-vermilion uppercase font-mono block">
                      Overdraft: {formatINR(dayState.overdraftAmount)}
                    </span>
                  )}
                </div>

                {/* Runway */}
                <div
                  className="p-3.5 rounded-xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm"
                  data-lens-title="Runway Days"
                  data-lens-formula="Balance ÷ Weighted Avg Daily Spend (₹"
                  data-lens-value={`${dayState.runwayDays} days`}
                  data-lens-explanation="How many days your current cash lasts at your recent weighted burn rate before hitting zero."
                >
                  <span className="text-[10px] uppercase font-mono font-bold text-ink-400 block mb-1">
                    Runway
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif font-bold text-xl text-ink-900 dark:text-ink-50">
                      {dayState.runwayDays}
                    </span>
                    <span className="text-[10px] text-ink-400 font-mono">days</span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-500 block truncate">
                    Burn: {formatINR(dayState.weightedAvgDailySpend)}/day
                  </span>
                </div>
              </div>

              {/* Risk Seal & Health Grade Ribbon */}
              <div className="p-4 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold text-ink-400 block mb-1">
                    Financial Status
                  </span>
                  <div className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
                    <span>Health Grade:</span>
                    <span className="px-1.5 py-0.5 rounded bg-brass/10 text-brass font-black font-mono">
                      {dayState.health.grade} ({dayState.health.score}/100)
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 line-clamp-1">
                    {dayState.health.keyRecommendation}
                  </p>
                </div>

                {/* Wax Seal Stamp */}
                <WaxSealStamp risk={dayState.risk} size="md" />
              </div>

              {/* Reserved Money Summary Pill */}
              <div
                className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs font-mono mb-4 border border-paper-border/60 dark:border-ink-800"
                data-lens-title="Reserved Money Breakdown"
                data-lens-formula="Bills (₹) + Subs (₹) + Buffer (₹1,000)"
                data-lens-value={formatINR(dayState.totalReserved)}
                data-lens-explanation="Funds quarantined so you don't accidentally spend money already owed to bills, subscriptions or emergency safety."
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-ink-600 dark:text-ink-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-brass" />
                    Reserved for Upcoming Dues:
                  </span>
                  <span className="text-ink-900 dark:text-ink-100 font-bold">
                    {formatINR(dayState.totalReserved)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-ink-500 pt-1 border-t border-black/5 dark:border-white/5">
                  <span>Bills: {formatINR(dayState.unpaidCommitmentsTotal)}</span>
                  <span>Subs: {formatINR(dayState.subscriptionsDueTotal)}</span>
                  <span>Buffer: {formatINR(dayState.emergencyBuffer)}</span>
                </div>
              </div>

              {/* Reactive Marginalia handwritten coaching note */}
              <MarginNote />
            </div>

            {/* Bottom chapter navigator for mobile */}
            <div className="lg:hidden flex items-center justify-between pt-3 border-t border-paper-border dark:border-ink-800">
              <span className="text-xs font-mono text-ink-400">
                Chapter {PAGES_ORDER[currentIndex].chapter}: {PAGES_ORDER[currentIndex].title}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1 rounded bg-black/5 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === PAGES_ORDER.length - 1}
                  className="p-1 rounded bg-black/5 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT PAGE: ACTIVE MODULE SCREEN (lg:col-span-8)                 */}
          {/* ================================================================= */}
          <div className="lg:col-span-8 p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative bg-white dark:bg-ink-900 min-h-[640px]">
            {/* Page Header (Chapter & Title) */}
            <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-brass uppercase tracking-widest bg-brass/10 px-2 py-0.5 rounded">
                  Chapter {PAGES_ORDER[currentIndex].chapter}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 dark:text-ink-50">
                  {PAGES_ORDER[currentIndex].title}
                </h2>
              </div>

              {/* Page turn arrow buttons */}
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-ink-400">
                <span>Page {currentIndex + 1} of {PAGES_ORDER.length}</span>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg border border-paper-border dark:border-ink-800 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === PAGES_ORDER.length - 1}
                  className="p-1.5 rounded-lg border border-paper-border dark:border-ink-800 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Page (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dynamic Content Transition */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePage}
                  initial={{ opacity: 0, x: reducedMotion ? 0 : 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reducedMotion ? 0 : -15 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {renderRightPageContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom page footnote bar */}
            <div className="pt-6 mt-6 border-t border-paper-border/60 dark:border-ink-800/60 flex items-center justify-between text-[11px] font-mono text-ink-400">
              <span className="italic font-serif text-xs">
                Inkwell · The 30-Day Financial Sketchbook for Gen Z
              </span>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">Use ← → arrow keys to flip</span>
                <span className="font-bold text-brass">₹10,000 Sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
