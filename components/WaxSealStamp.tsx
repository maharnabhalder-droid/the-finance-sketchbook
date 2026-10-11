"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, AlertOctagon, X, ChevronRight } from "lucide-react";
import { RiskBreakdown, RiskLevel } from "../lib/engine/types";
import { formatINR } from "../lib/engine/finance";

interface WaxSealStampProps {
  risk: RiskBreakdown;
  size?: "sm" | "md" | "lg";
}

export function WaxSealStamp({ risk, size = "md" }: WaxSealStampProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSealTheme = (level: RiskLevel) => {
    switch (level) {
      case "Safe":
        return {
          bg: "bg-sage hover:bg-sage-dark text-white",
          border: "border-sage-dark/40",
          ring: "ring-sage/30",
          shadow: "shadow-lg shadow-sage/25",
          icon: ShieldCheck,
          label: "SAFE",
          tagline: "Solid Runway & Bill Coverage",
        };
      case "Watch":
        return {
          bg: "bg-saffron hover:bg-saffron-dark text-white",
          border: "border-saffron-dark/40",
          ring: "ring-saffron/30",
          shadow: "shadow-lg shadow-saffron/25",
          icon: AlertTriangle,
          label: "WATCH",
          tagline: "Tightening Allowance Ahead",
        };
      case "Danger":
        return {
          bg: "bg-vermilion hover:bg-vermilion-dark text-white",
          border: "border-vermilion-dark/40",
          ring: "ring-vermilion/30",
          shadow: "shadow-lg shadow-vermilion/30",
          icon: AlertOctagon,
          label: "DANGER",
          tagline: "Overdraft or Default Risk",
        };
    }
  };

  const theme = getSealTheme(risk.level);
  const Icon = theme.icon;

  const sizeClasses = {
    sm: "w-16 h-16 text-[10px]",
    md: "w-24 h-24 text-xs",
    lg: "w-28 h-28 text-sm",
  }[size];

  return (
    <>
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(true)}
        data-lens-title="Financial Risk Wax Seal"
        data-lens-formula="Score = f(RunwayShortfall, BillDeficit, BufferDepleted, SubsLoad%)"
        data-lens-value={`${risk.level} (${risk.score}/100)`}
        data-lens-explanation="Evaluates if your cash can cover remaining fixed commitments, emergency events, and daily living through Day 30."
      >
        {/* Animated wax seal container with thump keyframe */}
        <motion.div
          key={risk.level + risk.score}
          initial={{ scale: 1.6, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: -2, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
          whileHover={{ scale: 1.05, rotate: 1 }}
          className={`${sizeClasses} ${theme.bg} ${theme.shadow} ${theme.border} rounded-full border-4 flex flex-col items-center justify-center select-none transition-transform relative p-1`}
          style={{
            clipPath:
              "polygon(50% 0%, 80% 10%, 100% 35%, 95% 70%, 75% 95%, 50% 100%, 25% 95%, 5% 70%, 0% 35%, 20% 10%)",
          }}
        >
          {/* Inner embossed wax ring */}
          <div className="w-[88%] h-[88%] rounded-full border border-white/40 flex flex-col items-center justify-center p-1 text-center">
            <Icon className="w-5 h-5 mb-0.5 opacity-90 drop-shadow" />
            <span className="font-serif font-black tracking-widest text-[11px] uppercase leading-none drop-shadow-sm">
              {theme.label}
            </span>
            <span className="font-mono text-[9px] font-bold opacity-85 mt-0.5">
              {risk.score}/100
            </span>
          </div>
        </motion.div>

        {/* Hover hint */}
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-ink-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Click for Risk Math
        </span>
      </div>

      {/* Risk Analysis Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-parchment-50 dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Top header */}
              <div className="flex items-start justify-between border-b border-paper-border dark:border-ink-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${theme.bg}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
                      Financial Risk Assessment
                    </h3>
                    <p className="text-xs text-ink-500 dark:text-ink-400 font-sans">
                      Status: <strong className="uppercase">{risk.level}</strong> (Score: {risk.score}/100)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-ink-400 hover:text-ink-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status summary banner */}
              <div
                className={`p-3 rounded-lg mb-4 text-xs font-medium border ${
                  risk.level === "Safe"
                    ? "bg-sage-light text-sage-dark border-sage/30"
                    : risk.level === "Watch"
                    ? "bg-saffron-light text-saffron-dark border-saffron/30"
                    : "bg-vermilion-light text-vermilion-dark border-vermilion/30"
                }`}
              >
                {theme.tagline}
              </div>

              {/* Contributing Risk Factors */}
              <div className="space-y-3 mb-5">
                <h4 className="text-xs uppercase font-bold tracking-wider text-ink-400">
                  Top Contributing Risk Drivers
                </h4>
                {risk.topFactors.length === 0 ? (
                  <p className="text-xs text-ink-500 italic">
                    No active risk drivers. All commitments, subscriptions and buffer targets are soundly covered.
                  </p>
                ) : (
                  risk.topFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-ink-800/60 rounded-xl border border-paper-border dark:border-ink-700/60 flex items-start gap-3"
                    >
                      <span className="w-5 h-5 rounded-full bg-brass/10 text-brass text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-ink-900 dark:text-ink-100">
                            {factor.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                            +{factor.scoreContribution} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed">
                          {factor.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Key Vital Ratios */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-paper-border dark:border-ink-800 text-center font-mono">
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <span className="text-[10px] text-ink-500 uppercase block mb-1">
                    Bill Coverage
                  </span>
                  <span className="text-xs font-bold text-ink-900 dark:text-ink-100">
                    {risk.commitmentCoverageRatio}x
                  </span>
                </div>
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <span className="text-[10px] text-ink-500 uppercase block mb-1">
                    Buffer Covered
                  </span>
                  <span className="text-xs font-bold text-ink-900 dark:text-ink-100">
                    {risk.emergencyBufferCoverage}%
                  </span>
                </div>
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <span className="text-[10px] text-ink-500 uppercase block mb-1">
                    Sub Load
                  </span>
                  <span className="text-xs font-bold text-ink-900 dark:text-ink-100">
                    {risk.subscriptionLoadPercent}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
