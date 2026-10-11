"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useFinanceStore } from "../lib/store/useFinanceStore";
import { formatINR } from "../lib/engine/finance";

interface LandingCoverProps {
  onOpenBook: () => void;
}

export function LandingCover({ onOpenBook }: LandingCoverProps) {
  const startBudget = useFinanceStore((state) => state.startBudget);
  const resetToDemo = useFinanceStore((state) => state.resetToDemo);
  const currentDay = useFinanceStore((state) => state.currentDay);

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [customBudget, setCustomBudget] = useState(startBudget.toString());

  const handleStartWithDemo = () => {
    resetToDemo();
    onOpenBook();
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Subtle background botanical watercolor wash */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-sage/10 dark:bg-sage/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brass/10 dark:bg-brass/5 blur-3xl pointer-events-none" />

      {/* Main 3D Closed Ledger Book Cover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl mx-auto"
      >
        <div
          onClick={onOpenBook}
          className="cursor-pointer group relative rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#2a3447] via-[#1a2333] to-[#0e1420] text-parchment-100 shadow-2xl border-4 border-[#3b475e] transition-transform duration-500 hover:scale-[1.01] overflow-hidden"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Leather Book Spine Binding on Left */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-[#121927] to-[#252f44] border-r-2 border-[#3b475e]/70 flex flex-col justify-around items-center py-6">
            <div className="w-1.5 h-1.5 rounded-full bg-brass/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-brass/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-brass/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-brass/60" />
          </div>

          {/* Gold Foil Corner Accents */}
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-brass/50 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brass/50 rounded-br-xl pointer-events-none" />

          {/* Cover Embossing */}
          <div className="pl-6 sm:pl-8 text-center space-y-6">
            {/* Wax Seal Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#b82e20] to-[#7f1d1d] shadow-lg flex items-center justify-center border-2 border-[#e65b4c] transform -rotate-6 group-hover:rotate-0 transition-transform">
              <span className="font-serif font-black text-2xl text-parchment-100 tracking-tighter">
                ₹
              </span>
            </div>

            <div>
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass block mb-1">
                The Personal Finance Sketchbook
              </span>
              <h1 className="font-serif font-black text-4xl sm:text-5xl text-parchment-100 tracking-tight">
                INKWELL
              </h1>
              <p className="font-hand text-xl sm:text-2xl text-brass-light mt-2">
                "Simulate every rupee before you commit it"
              </p>
            </div>

            {/* Gen Z Context Badge */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 text-xs font-mono text-parchment-300 max-w-md mx-auto space-y-1">
              <div className="flex justify-between items-center text-brass font-bold">
                <span>Cycle: 30 Days</span>
                <span>Starting Budget: ₹{formatINR(startBudget)}</span>
              </div>
              <p className="text-[11px] text-parchment-400">
                Swiggy · Ola · Jio Recharge · Spotify ₹59 · Goa Wishlist · Life Shocks
              </p>
            </div>

            {/* Click to open action indicator */}
            <div className="pt-2 flex items-center justify-center gap-2 text-brass text-sm font-serif font-bold group-hover:translate-x-1 transition-transform">
              <BookOpen className="w-4 h-4" />
              <span>Click to Open Ledger</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* CTA Buttons Underneath Cover */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleStartWithDemo}
            className="w-full sm:w-auto btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Demo Ledger (Day 12 / 30)</span>
          </button>

          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="w-full sm:w-auto btn-secondary py-3 px-6 text-sm flex items-center justify-center gap-2"
          >
            <Sliders className="w-4 h-4" />
            <span>Customize Seed Budget</span>
          </button>
        </div>

        {/* Value Highlights */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-ink-900/40 border border-paper-border dark:border-ink-800">
            <span className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 block">
              1. What-If Sandbox
            </span>
            <span className="text-xs text-ink-500 mt-1 block">
              Test Friday binge orders or phone recharges before spending real cash.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/40 dark:bg-ink-900 border border-paper-border dark:border-ink-800">
            <span className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 block">
              2. Ripple Effects
            </span>
            <span className="text-xs text-ink-500 mt-1 block">
              Every choice shifts your daily allowance, runway, and risk seal in real-time.
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/40 dark:bg-ink-900 border border-paper-border dark:border-ink-800">
            <span className="font-serif font-bold text-sm text-ink-900 dark:text-ink-100 block">
              3. The Brass Lens
            </span>
            <span className="text-xs text-ink-500 mt-1 block">
              Magnify any number or subscription to reveal its exact mathematical formula.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Onboarding / Seed Customizer Modal */}
      <AnimatePresence>
        {isOnboardingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-ink-900 border border-paper-border dark:border-ink-800 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-paper-border dark:border-ink-800 pb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase font-bold text-brass tracking-wider">
                    Ledger Setup
                  </span>
                  <h3 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
                    Seed Your 30-Day Budget
                  </h3>
                </div>
                <button
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="text-ink-400 hover:text-ink-800 dark:hover:text-ink-200 text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-ink-600 dark:text-ink-300 mb-1">
                    Total Starting Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    className="w-full p-3 rounded-xl border border-paper-border dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 font-serif text-lg font-bold"
                  />
                  <span className="text-[11px] text-ink-400 font-mono mt-1 block">
                    Default is ₹10,000 for standard Indian Gen Z student/intern benchmark.
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-parchment-50 dark:bg-ink-950 border border-paper-border dark:border-ink-800 text-xs space-y-2">
                  <span className="font-bold font-serif text-ink-900 dark:text-ink-100 block">
                    Preloaded Indian Gen Z Ledger Includes:
                  </span>
                  <ul className="space-y-1 text-ink-600 dark:text-ink-400">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                      ₹239 Jio 28-day 1.5GB/day mobile recharge commitment
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                      ₹59 Spotify Student Premium subscription
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                      ₹199 Netflix Mobile screen subscription
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sage" />
                      ₹2,500 Goa Weekend Getaway wishlist goal
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    useFinanceStore.setState({
                      startBudget: parseFloat(customBudget) || 10000,
                    });
                    setIsOnboardingModalOpen(false);
                    onOpenBook();
                  }}
                  className="btn-primary flex-1 py-2.5 text-sm"
                >
                  Confirm & Open Ledger
                </button>
                <button
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="btn-secondary py-2.5 px-4 text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
