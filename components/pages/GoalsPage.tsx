"use client";

import React, { useState } from "react";
import { Plus, Target, CheckCircle2, AlertCircle, Sparkles, PiggyBank } from "lucide-react";
import { DayState, SavingsGoal } from "../../lib/engine/types";
import { formatINR } from "../../lib/engine/finance";
import { useFinanceStore } from "../../lib/store/useFinanceStore";

interface GoalsPageProps {
  dayState: DayState;
}

export function GoalsPage({ dayState }: GoalsPageProps) {
  const goals = useFinanceStore((state) => state.goals);
  const addSavingsGoal = useFinanceStore((state) => state.addSavingsGoal);
  const addMoneyToGoal = useFinanceStore((state) => state.addMoneyToGoal);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("28");
  const [newGoalEmoji, setNewGoalEmoji] = useState("✨");

  const [allocateModalGoal, setAllocateModalGoal] = useState<SavingsGoal | null>(null);
  const [allocateAmount, setAllocateAmount] = useState("200");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget) || 0;
    if (!newGoalName.trim() || target <= 0) return;

    addSavingsGoal({
      name: newGoalName.trim(),
      target,
      deadlineDay: parseInt(newGoalDeadline) || 28,
      priority: "medium",
      emoji: newGoalEmoji,
    });

    setNewGoalName("");
    setNewGoalTarget("");
    setIsAddOpen(false);
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModalGoal) return;
    const amount = parseFloat(allocateAmount) || 0;
    if (amount <= 0) return;

    addMoneyToGoal(allocateModalGoal.id, amount);
    setAllocateModalGoal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-parchment-100 dark:bg-ink-800/40 border border-paper-border dark:border-ink-800">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold text-brass tracking-wider block mb-0.5">
            Taped-in Goal Notebook
          </span>
          <h3 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
            {goals.length} Tracked Dreams · Total Saved: {formatINR(dayState.totalMovedToGoals)}
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-300">
            Goal reserves stay locked from your daily allowance so you reach the finish line without panic.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 text-xs font-bold rounded-lg bg-brass text-white hover:bg-brass-dark transition-all flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Savings Goal</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {goals.map((goal) => {
          const projection = dayState.goalProjections.find((p) => p.goalId === goal.id);
          const percent = projection ? projection.percentComplete : 0;
          const isOnTrack = projection ? projection.isOnTrack : true;
          const remainingGap = Math.max(0, goal.target - goal.saved);

          return (
            <div
              key={goal.id}
              className="sketch-card p-5 relative overflow-hidden"
              data-lens-title={`Goal: ${goal.name}`}
              data-lens-formula={`Saved ${formatINR(goal.saved)} ÷ Target ${formatINR(goal.target)}`}
              data-lens-value={`${percent}% funded`}
              data-lens-explanation={`Needs ${formatINR(projection?.dailySavingsNeeded || 0)}/day across the remaining days to hit deadline on Day ${goal.deadlineDay}.`}
            >
              {/* Taped paper visual effect */}
              <div className="w-20 h-4 absolute -top-2 left-8 washi-tape -rotate-2 rounded-sm opacity-80" />

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{goal.emoji || "🎯"}</span>
                  <div>
                    <h4 className="font-serif font-bold text-base text-ink-900 dark:text-ink-50">
                      {goal.name}
                    </h4>
                    <span className="text-[10px] text-ink-400 font-mono">
                      Target Deadline: Day {goal.deadlineDay} ({Math.max(0, goal.deadlineDay - dayState.currentDay)} days left)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-base text-ink-900 dark:text-ink-50 block">
                    {formatINR(goal.saved)}
                  </span>
                  <span className="text-[10px] text-ink-400 font-mono">
                    of {formatINR(goal.target)}
                  </span>
                </div>
              </div>

              {/* Progress Wash Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-ink-600 dark:text-ink-400">
                    {percent}% Reached
                  </span>
                  <span className="text-ink-500 font-bold">
                    Gap: {formatINR(remainingGap)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent >= 100
                        ? "bg-sage"
                        : isOnTrack
                        ? "watercolor-wash-green"
                        : "watercolor-wash-amber"
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>

              {/* Status & Daily Run Rate */}
              <div className="p-2.5 rounded-lg bg-parchment-50 dark:bg-ink-800/50 border border-paper-border/60 dark:border-ink-700/60 mb-3 text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-1.5">
                  {isOnTrack ? (
                    <span className="text-sage-dark dark:text-sage-light font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> On Track
                    </span>
                  ) : (
                    <span className="text-saffron-dark dark:text-saffron-light font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Lagging
                    </span>
                  )}
                </div>

                <span className="text-ink-600 dark:text-ink-300">
                  Daily Need: <strong>{formatINR(projection?.dailySavingsNeeded || 0)}/day</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setAllocateModalGoal(goal)}
                className="w-full py-2 px-3 rounded-lg text-xs font-bold font-mono bg-brass text-white hover:bg-brass-dark transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <PiggyBank className="w-3.5 h-3.5" />
                <span>Tuck ₹ Away into this Goal</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Money Modal */}
      {allocateModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl p-5">
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50 mb-1">
              Deposit to: {allocateModalGoal.name}
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Moving cash into savings safely locks it from your everyday daily allowance.
            </p>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  max={dayState.remainingBalance}
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono font-bold rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAllocateModalGoal(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-black/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-brass text-white rounded-lg hover:bg-brass-dark"
                >
                  Deposit {formatINR(parseFloat(allocateAmount) || 0)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-ink-900 border-2 border-paper-border dark:border-ink-700 rounded-2xl shadow-2xl p-5">
            <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50 mb-1">
              New Savings Goal
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Define a wishlist target to track across your 30-day budget.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Leather Jacket"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="2500"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1">
                    Deadline Day (1-30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-paper-border dark:border-ink-700 bg-parchment-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-ink-500 hover:bg-black/5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-brass text-white rounded-lg hover:bg-brass-dark"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
