"use client";

import React from "react";
import {
  Activity,
  Award,
  Zap,
  Sparkles,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Compass,
  TrendingUp,
} from "lucide-react";
import { DayState } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface HealthInsightsPageProps {
  dayState: DayState;
}

export function HealthInsightsPage({ dayState }: HealthInsightsPageProps) {
  const currentDay = useFinanceStore((state) => state.currentDay);
  const streakDays = useFinanceStore((state) => state.streakDays);
  const unlockedBadges = useFinanceStore((state) => state.unlockedBadges);
  const transactions = useFinanceStore((state) => state.transactions);

  const worthItSpend = transactions
    .filter((t) => t.sentiment === "worth_it")
    .reduce((sum, t) => sum + t.amount, 0);
  const regretSpend = transactions
    .filter((t) => t.sentiment === "regret")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalTaggedSpend = worthItSpend + regretSpend;
  const worthItRatio =
    totalTaggedSpend > 0 ? Math.round((worthItSpend / totalTaggedSpend) * 100) : 100;

  const health = dayState.health;

  const subScores = [
    {
      name: "Budget Adherence",
      weight: "25 pts",
      score: health.subScores.budgetAdherence,
      max: 25,
      desc: "Staying within daily safe ceilings and avoiding binge spending",
      barColor: "bg-sage",
    },
    {
      name: "Savings Pace",
      weight: "25 pts",
      score: health.subScores.savingsProgress,
      max: 25,
      desc: "Progress towards emergency safety buffer and wishlist goals",
      barColor: "bg-lavender",
    },
    {
      name: "Risk Control",
      weight: "20 pts",
      score: health.subScores.riskControl,
      max: 20,
      desc: "Runway cushion vs 30-day timeline and fixed bill coverage",
      barColor: "bg-brass",
    },
    {
      name: "Subscription Hygiene",
      weight: "15 pts",
      score: health.subScores.subscriptionHygiene,
      max: 15,
      desc: "Preventing subscription creep (<15% of total ₹10k budget)",
      barColor: "bg-saffron",
    },
    {
      name: "Spending Consistency",
      weight: "15 pts",
      score: health.subScores.spendingConsistency,
      max: 15,
      desc: "Low day-to-day variance without extreme binge days",
      barColor: "bg-teal-600",
    },
  ];

  const badges = [
    {
      id: "No-spend Sunday",
      title: "No-Spend Sunday",
      desc: "Kept a non-essential spend day strictly at ₹0",
      icon: Award,
      unlocked: unlockedBadges.includes("No-spend Sunday"),
    },
    {
      id: "Subscription Slayer",
      title: "Subscription Slayer",
      desc: "Kept active monthly recurring drain below ₹150",
      icon: ShieldCheck,
      unlocked: dayState.subscriptionsDueTotal <= 150,
    },
    {
      id: "Emergency Shield",
      title: "The Inkpot Shield",
      desc: "Successfully locked a ₹1,000+ uncompromised emergency buffer",
      icon: Flame,
      unlocked: dayState.emergencyBuffer >= 1000,
    },
    {
      id: "Day 15 Pilgrim",
      title: "Halfway Pilgrim",
      desc: "Crossed Day 15 with positive cash balance intact",
      icon: Compass,
      unlocked: currentDay >= 15,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chapter Subheading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-paper-border dark:border-ink-800 pb-3">
        <div>
          <span className="font-hand text-lg text-ink-500 block -mb-1">
            "Your Financial Pulse & Mindset..."
          </span>
          <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
            Health Composite Index & Behavioral Milestones
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-paper-border dark:border-ink-800 bg-black/5 dark:bg-white/5 font-mono text-xs flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-saffron" />
            <span>
              Streak: <strong>{streakDays} days</strong> below safe allowance
            </span>
          </div>
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score & Letter Grade */}
        <div
          className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm flex flex-col justify-between"
          data-lens-title="Financial Health Composite"
          data-lens-formula="Weighted: Adherence(25) + Goals(25) + Risk(20) + Subs(15) + Consistency(15)"
          data-lens-value={`${health.score}/100 (Grade ${health.grade})`}
          data-lens-explanation="An overall gauge of fiscal stamina. Reflects whether you are surviving or thriving in your 30-day budget."
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-ink-400">
                Composite Vitality
              </span>
              <Activity className="w-4 h-4 text-brass" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-serif font-black text-5xl text-ink-900 dark:text-ink-50">
                {health.score}
              </span>
              <span className="font-serif text-2xl text-ink-400">/ 100</span>
              <span className="font-serif text-3xl font-black text-brass ml-auto">
                Grade {health.grade}
              </span>
            </div>
            <span className="text-xs font-mono text-ink-500 mt-1 block">
              {health.score >= 80
                ? "Stellar Resilience"
                : health.score >= 60
                ? "Balanced & Controlled"
                : "Cautionary Tightrope"}
            </span>
          </div>

          <div className="mt-6 pt-4 border-t border-paper-border dark:border-ink-800">
            <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-saffron via-brass to-sage rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(0, health.score))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-ink-400 mt-1">
              <span>0 (Deficit)</span>
              <span>50 (Moderate)</span>
              <span>100 (Optimal)</span>
            </div>
          </div>
        </div>

        {/* Leverage Recommendation */}
        <div className="p-6 rounded-2xl bg-parchment-50 dark:bg-ink-950/70 border-l-4 border-l-brass border-y border-r border-paper-border dark:border-ink-700/80 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brass mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-serif text-xs font-bold uppercase tracking-wider">
                Highest-Leverage Improvement
              </span>
            </div>
            <h4 className="font-serif text-base font-bold text-ink-900 dark:text-ink-100 mb-2">
              Coach Recommendation to Boost Your Score:
            </h4>
            <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed font-sans">
              "{health.keyRecommendation}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-paper-border dark:border-ink-800 flex flex-wrap items-center justify-between text-xs text-ink-500 gap-2">
            <span className="font-hand text-base text-ink-600 dark:text-ink-300">
              💡 Remember: Testing decisions in the Simulator protects your real health score.
            </span>
          </div>
        </div>
      </div>

      {/* 5 Weighted Pillars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3">
          <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100">
            The 5 Diagnostic Pillars
          </h4>
          <span className="font-mono text-xs text-ink-400">Total Max = 100 pts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subScores.map((p, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-paper-border dark:border-ink-800 bg-parchment-50/40 dark:bg-ink-950/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-900 dark:text-ink-100">
                    {p.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 font-bold text-ink-500">
                    {p.weight}
                  </span>
                </div>
                <p className="text-[11px] text-ink-500 mt-1">{p.desc}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-ink-400">Yield</span>
                  <span className="font-bold text-ink-900 dark:text-ink-100">
                    {Math.round(p.score)} / {p.max}
                  </span>
                </div>
                <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${p.barColor}`}
                    style={{ width: `${Math.min(100, Math.max(0, (p.score / p.max) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Innovation Feature: Gen Z Mindfulness & Regret Quotient */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sage/10 via-parchment-50 to-lavender/10 dark:from-sage/5 dark:via-ink-900 dark:to-lavender/5 border border-paper-border dark:border-ink-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sage-dark dark:text-sage-light flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Mindfulness & Regret Quotient
          </span>
          <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100">
            {worthItRatio}% High-Satisfaction Choices
          </h4>
          <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5 max-w-xl">
            You spent <strong>{formatINR(worthItSpend)}</strong> on purchases tagged as high-value / worth-it, compared to <strong>{formatINR(regretSpend)}</strong> on impulse regrets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-sage-dark dark:text-sage-light block">
              ✨ {formatINR(worthItSpend)} Worth-It
            </span>
            <span className="text-xs font-mono font-bold text-vermilion block">
              💔 {formatINR(regretSpend)} Regret
            </span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-sage/40 flex items-center justify-center font-serif font-black text-sm text-ink-900 dark:text-ink-100 bg-white dark:bg-ink-900 shadow-inner">
            {worthItRatio}%
          </div>
        </div>
      </div>

      {/* Gamified Badges */}
      <div className="p-6 rounded-2xl bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-700/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3">
          <div>
            <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-brass" />
              Sketchbook Milestones & Badges
            </h4>
            <p className="text-xs text-ink-500">
              Positive Gen Z behavioral reinforcement earned over the 30 days
            </p>
          </div>
          <span className="font-mono text-xs text-brass font-bold">
            {badges.filter((b) => b.unlocked).length} / {badges.length} Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  b.unlocked
                    ? "bg-white dark:bg-ink-900 border-brass/40 shadow-sm"
                    : "bg-black/[0.02] dark:bg-white/[0.02] border-paper-border dark:border-ink-800 opacity-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        b.unlocked
                          ? "bg-brass/10 text-brass border border-brass/30"
                          : "bg-black/5 dark:bg-white/5 text-ink-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {b.unlocked ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sage/10 text-sage-dark dark:text-sage-light border border-sage/30 font-bold">
                        Earned ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-ink-400">
                        In Progress
                      </span>
                    )}
                  </div>
                  <h5 className="font-serif text-sm font-bold text-ink-900 dark:text-ink-100">
                    {b.title}
                  </h5>
                  <p className="text-[11px] text-ink-500 mt-1 leading-snug">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
