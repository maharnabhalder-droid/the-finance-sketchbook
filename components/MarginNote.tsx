"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, CheckCircle2, Bookmark } from "lucide-react";
import { useFinanceStore } from "../lib/store/useFinanceStore";

export function MarginNote() {
  const getMarginNote = useFinanceStore((state) => state.getMarginNote);
  const { note, tone } = getMarginNote();

  const toneStyles = {
    praise: {
      border: "border-sage/40",
      bg: "bg-sage-light/60 dark:bg-sage-dark/20",
      text: "text-sage-dark dark:text-sage-light",
      icon: CheckCircle2,
      tape: "bg-sage/20",
    },
    caution: {
      border: "border-saffron/40",
      bg: "bg-saffron-light/60 dark:bg-saffron-dark/20",
      text: "text-saffron-dark dark:text-saffron-light",
      icon: AlertCircle,
      tape: "bg-saffron/20",
    },
    danger: {
      border: "border-vermilion/40",
      bg: "bg-vermilion-light/60 dark:bg-vermilion-dark/20",
      text: "text-vermilion-dark dark:text-vermilion-light",
      icon: AlertCircle,
      tape: "bg-vermilion/20",
    },
    tip: {
      border: "border-brass/30",
      bg: "bg-brass-light/60 dark:bg-brass-dark/20",
      text: "text-brass-dark dark:text-brass-light",
      icon: Sparkles,
      tape: "bg-brass/20",
    },
  }[tone];

  const Icon = toneStyles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, rotate: -2, y: 10 }}
      animate={{ opacity: 1, rotate: -1.2, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`relative p-3.5 rounded-xl border ${toneStyles.border} ${toneStyles.bg} shadow-sm my-3 select-none`}
    >
      {/* Visual washi tape on the top edge */}
      <div
        className={`w-16 h-3.5 absolute -top-2 left-1/2 -translate-x-1/2 washi-tape rotate-1 rounded-sm opacity-80`}
      />

      <div className="flex items-start gap-2.5">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${toneStyles.text}`} />
        <div className="flex-1">
          <span className="block text-[11px] uppercase tracking-wider font-bold text-ink-500 font-mono mb-0.5">
            Marginalia Coaching
          </span>
          <p className="font-hand text-lg leading-snug text-ink-800 dark:text-ink-100 font-medium">
            "{note}"
          </p>
        </div>
      </div>
    </motion.div>
  );
}
