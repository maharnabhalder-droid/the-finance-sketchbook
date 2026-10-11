"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X } from "lucide-react";
import { useFinanceStore } from "../lib/store/useFinanceStore";

export interface LensTargetData {
  title: string;
  formula: string;
  explanation: string;
  currentValue?: string;
}

export function TheLens() {
  const isLensActive = useFinanceStore((state) => state.isLensActive);
  const toggleLens = useFinanceStore((state) => state.toggleLens);
  const reducedMotion = useFinanceStore((state) => state.reducedMotion);

  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [lensData, setLensData] = useState<LensTargetData | null>(null);
  const [isHoveringTarget, setIsHoveringTarget] = useState(false);

  useEffect(() => {
    if (!isLensActive) {
      setLensData(null);
      setIsHoveringTarget(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Check if hovering an element with data-lens-title
      const target = (e.target as HTMLElement).closest("[data-lens-title]");
      if (target) {
        const title = target.getAttribute("data-lens-title") || "";
        const formula = target.getAttribute("data-lens-formula") || "";
        const explanation = target.getAttribute("data-lens-explanation") || "";
        const currentValue = target.getAttribute("data-lens-value") || "";

        setLensData({ title, formula, explanation, currentValue });
        setIsHoveringTarget(true);
      } else {
        setIsHoveringTarget(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isLensActive]);

  if (!isLensActive) {
    return (
      <button
        onClick={toggleLens}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-full shadow-lg bg-brass text-white hover:bg-brass-dark transition-all hover:scale-105"
        title="Activate The Lens magnifying inspector"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Lens: Off</span>
      </button>
    );
  }

  return (
    <>
      {/* Floating brass magnifying-glass follower */}
      <AnimatePresence>
        {isHoveringTarget && lensData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: mousePos.x + 24,
              y: mousePos.y - 40,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: reducedMotion ? "tween" : "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="fixed pointer-events-none z-50 max-w-sm rounded-xl p-3.5 shadow-2xl backdrop-blur-md bg-white/95 dark:bg-ink-900/95 border-2 border-brass/60"
            style={{
              boxShadow: "0 12px 36px -4px rgba(180, 83, 9, 0.35), 0 0 0 1px rgba(180, 83, 9, 0.2)",
            }}
          >
            {/* Loupe brass rim highlight */}
            <div className="flex items-center gap-2 border-b border-brass/20 pb-2 mb-2">
              <div className="w-5 h-5 rounded-full border-2 border-brass flex items-center justify-center bg-brass/10">
                <Search className="w-2.5 h-2.5 text-brass" />
              </div>
              <span className="font-serif text-xs font-bold text-ink-900 dark:text-ink-50">
                {lensData.title}
              </span>
              {lensData.currentValue && (
                <span className="ml-auto text-xs font-mono font-bold text-brass bg-brass/10 px-1.5 py-0.5 rounded">
                  {lensData.currentValue}
                </span>
              )}
            </div>

            {/* Formula Breakdown */}
            {lensData.formula && (
              <div className="mb-2 bg-parchment-100 dark:bg-ink-800/80 p-2 rounded border border-brass/15 font-mono text-[11px] text-ink-700 dark:text-ink-300 break-words">
                <span className="text-[10px] uppercase font-bold text-brass tracking-wider block mb-0.5">
                  Formula Math:
                </span>
                {lensData.formula}
              </div>
            )}

            {/* Explanatory annotation */}
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              {lensData.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent corner status badge */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5">
        <button
          onClick={toggleLens}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-full shadow-lg bg-brass text-white hover:bg-brass-dark transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
          <span>The Lens: Active</span>
          <X className="w-3.5 h-3.5 ml-1 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </>
  );
}
