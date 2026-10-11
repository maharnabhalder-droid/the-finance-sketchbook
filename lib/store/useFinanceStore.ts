import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
  IncomeEvent,
  UnexpectedEvent,
  Scenario,
  SimulationDecision,
  SimulationDiff,
  DayState,
} from "../engine/types";
import { computeDayState, simulateScenario } from "../engine/finance";
import { INITIAL_SEED_DATA } from "../seed/demo-data";

export type LedgerPageId =
  | "overview"
  | "spending"
  | "commitments"
  | "goals"
  | "simulator"
  | "forecast"
  | "health"
  | "report";

export interface FinanceStoreState {
  startBudget: number;
  currentDay: number;
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
  incomeEvents: IncomeEvent[];
  unexpectedEvents: UnexpectedEvent[];

  // App UI State
  activePage: LedgerPageId;
  isLensActive: boolean;
  theme: "parchment" | "midnight";
  reducedMotion: boolean;
  isBookOpen: boolean;

  // Simulator State
  activeSimulationDecisions: SimulationDecision[];
  savedScenarios: Scenario[];

  // Gamification & Badges
  unlockedBadges: string[];
  streakDays: number;

  // Actions
  addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  toggleCommitmentPaid: (id: string) => void;
  toggleSubscriptionActive: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "saved">) => void;
  addMoneyToGoal: (goalId: string, amount: number) => void;
  resolveUnexpectedEvent: (
    id: string,
    choice: "pay" | "defer" | "split" | "borrow_from_goal",
    borrowGoalId?: string
  ) => void;

  // Time Navigation
  advanceToNextDay: () => void;
  fastForwardToDay: (targetDay: number) => void;

  // Simulator Actions
  addSimulationDecision: (decision: Omit<SimulationDecision, "id">) => void;
  removeSimulationDecision: (id: string) => void;
  clearSimulationDecisions: () => void;
  commitActiveSimulation: () => { undo: () => void };

  // UI Controls
  setActivePage: (page: LedgerPageId) => void;
  toggleLens: () => void;
  setLensActive: (active: boolean) => void;
  setTheme: (theme: "parchment" | "midnight") => void;
  toggleTheme: () => void;
  setReducedMotion: (reduced: boolean) => void;
  openBook: () => void;
  resetToDemo: () => void;

  // Computed Selectors (helpers)
  getDayState: () => DayState;
  getSimulationDiff: () => SimulationDiff;
  getMarginNote: () => { note: string; tone: "caution" | "praise" | "tip" | "danger" };
}

export const useFinanceStore = create<FinanceStoreState>()(
  persist(
    (set, get) => ({
      startBudget: INITIAL_SEED_DATA.startBudget,
      currentDay: INITIAL_SEED_DATA.currentDay,
      transactions: INITIAL_SEED_DATA.transactions,
      commitments: INITIAL_SEED_DATA.commitments,
      subscriptions: INITIAL_SEED_DATA.subscriptions,
      goals: INITIAL_SEED_DATA.goals,
      incomeEvents: INITIAL_SEED_DATA.incomeEvents,
      unexpectedEvents: INITIAL_SEED_DATA.unexpectedEvents,

      activePage: "overview",
      isLensActive: true,
      theme: "parchment",
      reducedMotion: false,
      isBookOpen: true,

      activeSimulationDecisions: [],
      savedScenarios: [],

      unlockedBadges: ["No-spend Sunday", "First Step"],
      streakDays: 3,

      addTransaction: (txData) => {
        const newTx: Transaction = {
          ...txData,
          id: `tx_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      toggleCommitmentPaid: (id) => {
        set((state) => ({
          commitments: state.commitments.map((c) =>
            c.id === id ? { ...c, isPaid: !c.isPaid } : c
          ),
        }));
      },

      toggleSubscriptionActive: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, active: !s.active } : s
          ),
        }));
      },

      addSavingsGoal: (goalData) => {
        const newGoal: SavingsGoal = {
          ...goalData,
          id: `goal_${Date.now()}`,
          saved: 0,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      addMoneyToGoal: (goalId, amount) => {
        set((state) => {
          const goal = state.goals.find((g) => g.id === goalId);
          if (!goal) return state;

          const updatedGoals = state.goals.map((g) =>
            g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g
          );

          // Add a transaction recording the transfer to savings
          const transferTx: Transaction = {
            id: `tx_goal_${Date.now()}`,
            title: `Saved for: ${goal.name}`,
            amount,
            day: state.currentDay,
            category: "Shopping & Personal",
            note: "Manual savings allocation",
            isEssential: true,
            createdAt: new Date().toISOString(),
          };

          return {
            goals: updatedGoals,
            transactions: [transferTx, ...state.transactions],
          };
        });
      },

      resolveUnexpectedEvent: (id, choice, borrowGoalId) => {
        set((state) => {
          const event = state.unexpectedEvents.find((e) => e.id === id);
          if (!event) return state;

          let updatedTransactions = [...state.transactions];
          let updatedGoals = [...state.goals];

          if (choice === "pay") {
            updatedTransactions.unshift({
              id: `tx_unexp_${Date.now()}`,
              title: `[Emergency Paid] ${event.title}`,
              amount: event.amount,
              day: state.currentDay,
              category: "Health & Emergency",
              note: event.description,
              isEssential: true,
              createdAt: new Date().toISOString(),
            });
          } else if (choice === "split") {
            updatedTransactions.unshift({
              id: `tx_unexp_split_${Date.now()}`,
              title: `[Split 50%] ${event.title}`,
              amount: Math.round(event.amount / 2),
              day: state.currentDay,
              category: "Health & Emergency",
              note: "Remaining half split via Splitwise UPI",
              isEssential: true,
              createdAt: new Date().toISOString(),
            });
          } else if (choice === "borrow_from_goal" && borrowGoalId) {
            updatedGoals = updatedGoals.map((g) =>
              g.id === borrowGoalId
                ? { ...g, saved: Math.max(0, g.saved - event.amount) }
                : g
            );
          }

          const updatedEvents = state.unexpectedEvents.map((e) =>
            e.id === id
              ? {
                  ...e,
                  resolved: true,
                  resolutionChoice: choice,
                  borrowedFromGoalId: borrowGoalId,
                }
              : e
          );

          return {
            unexpectedEvents: updatedEvents,
            transactions: updatedTransactions,
            goals: updatedGoals,
          };
        });
      },

      advanceToNextDay: () => {
        set((state) => {
          const nextDay = Math.min(30, state.currentDay + 1);

          // Check if today was under safe daily allowance to advance streak
          const currentState = computeDayState({
            currentDay: state.currentDay,
            startBudget: state.startBudget,
            transactions: state.transactions,
            commitments: state.commitments,
            subscriptions: state.subscriptions,
            goals: state.goals,
            incomeEvents: state.incomeEvents,
            unexpectedEvents: state.unexpectedEvents,
          });

          const todaySpends = state.transactions
            .filter((t) => t.day === state.currentDay)
            .reduce((sum, t) => sum + t.amount, 0);

          const isUnder = todaySpends <= currentState.safeDailyAllowance * 1.1;
          const newStreak = isUnder ? state.streakDays + 1 : 0;

          return {
            currentDay: nextDay,
            streakDays: newStreak,
          };
        });
      },

      fastForwardToDay: (targetDay) => {
        set(() => ({
          currentDay: Math.min(30, Math.max(1, targetDay)),
        }));
      },

      addSimulationDecision: (decisionData) => {
        const newDecision: SimulationDecision = {
          ...decisionData,
          id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        };
        set((state) => ({
          activeSimulationDecisions: [...state.activeSimulationDecisions, newDecision],
        }));
      },

      removeSimulationDecision: (id) => {
        set((state) => ({
          activeSimulationDecisions: state.activeSimulationDecisions.filter(
            (d) => d.id !== id
          ),
        }));
      },

      clearSimulationDecisions: () => {
        set({ activeSimulationDecisions: [] });
      },

      commitActiveSimulation: () => {
        const state = get();
        const decisions = state.activeSimulationDecisions;
        if (decisions.length === 0) return { undo: () => {} };

        // Save snapshot for instant undo
        const snapshotTransactions = [...state.transactions];
        const snapshotSubscriptions = [...state.subscriptions];
        const snapshotCommitments = [...state.commitments];
        const snapshotGoals = [...state.goals];
        const snapshotIncome = [...state.incomeEvents];

        let newTxs = [...state.transactions];
        let newSubs = state.subscriptions.map((s) => ({ ...s }));
        let newComms = state.commitments.map((c) => ({ ...c }));
        let newGoals = state.goals.map((g) => ({ ...g }));
        let newIncome = [...state.incomeEvents];

        for (const dec of decisions) {
          if (dec.type === "one_off_purchase" || dec.type === "unexpected_expense") {
            newTxs.unshift({
              id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              title: dec.title,
              amount: dec.amount,
              day: state.currentDay,
              category: dec.type === "unexpected_expense" ? "Health & Emergency" : "Shopping & Personal",
              createdAt: new Date().toISOString(),
            });
          } else if (dec.type === "new_subscription") {
            newSubs.push({
              id: `sub_${Date.now()}`,
              name: dec.title,
              price: dec.amount,
              cycle: "monthly",
              dueDay: Math.min(30, state.currentDay + 7),
              active: true,
              category: "Streaming",
            });
          } else if (dec.type === "cancel_subscription" && dec.targetId) {
            newSubs = newSubs.map((s) => (s.id === dec.targetId ? { ...s, active: false } : s));
          } else if (dec.type === "side_income") {
            newIncome.push({
              id: `inc_${Date.now()}`,
              title: dec.title,
              amount: dec.amount,
              day: state.currentDay,
              category: "Freelance",
              received: true,
            });
          } else if (dec.type === "goal_transfer" && dec.targetId) {
            newGoals = newGoals.map((g) =>
              g.id === dec.targetId ? { ...g, saved: Math.max(0, g.saved + dec.amount) } : g
            );
          }
        }

        set({
          transactions: newTxs,
          subscriptions: newSubs,
          commitments: newComms,
          goals: newGoals,
          incomeEvents: newIncome,
          activeSimulationDecisions: [],
        });

        // Return undo closure
        return {
          undo: () => {
            set({
              transactions: snapshotTransactions,
              subscriptions: snapshotSubscriptions,
              commitments: snapshotCommitments,
              goals: snapshotGoals,
              incomeEvents: snapshotIncome,
            });
          },
        };
      },

      setActivePage: (page) => set({ activePage: page }),
      toggleLens: () => set((state) => ({ isLensActive: !state.isLensActive })),
      setLensActive: (active) => set({ isLensActive: active }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "parchment" ? "midnight" : "parchment",
        })),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      openBook: () => set({ isBookOpen: true }),
      resetToDemo: () =>
        set({
          startBudget: INITIAL_SEED_DATA.startBudget,
          currentDay: INITIAL_SEED_DATA.currentDay,
          transactions: INITIAL_SEED_DATA.transactions,
          commitments: INITIAL_SEED_DATA.commitments,
          subscriptions: INITIAL_SEED_DATA.subscriptions,
          goals: INITIAL_SEED_DATA.goals,
          incomeEvents: INITIAL_SEED_DATA.incomeEvents,
          unexpectedEvents: INITIAL_SEED_DATA.unexpectedEvents,
          activeSimulationDecisions: [],
          streakDays: 3,
        }),

      getDayState: () => {
        const state = get();
        return computeDayState({
          currentDay: state.currentDay,
          startBudget: state.startBudget,
          transactions: state.transactions,
          commitments: state.commitments,
          subscriptions: state.subscriptions,
          goals: state.goals,
          incomeEvents: state.incomeEvents,
          unexpectedEvents: state.unexpectedEvents,
        });
      },

      getSimulationDiff: () => {
        const state = get();
        return simulateScenario(
          {
            currentDay: state.currentDay,
            startBudget: state.startBudget,
            transactions: state.transactions,
            commitments: state.commitments,
            subscriptions: state.subscriptions,
            goals: state.goals,
            incomeEvents: state.incomeEvents,
            unexpectedEvents: state.unexpectedEvents,
          },
          state.activeSimulationDecisions
        );
      },

      getMarginNote: () => {
        const state = get();
        const dayState = state.getDayState();
        const { safeDailyAllowance, daysRemaining, remainingBalance, risk, currentDay } = dayState;

        // Contextual Gen Z annotations
        if (remainingBalance < 0) {
          return {
            note: "🚨 Overdraft alert! Put the UPI app away. Every extra rupee is debt right now.",
            tone: "danger",
          };
        }

        if (risk.level === "Danger") {
          return {
            note: "⚠️ 2 fixed bills due this week. Lock away your buffer or you'll default on recharge!",
            tone: "caution",
          };
        }

        if (currentDay === 10 || currentDay === 11) {
          return {
            note: "Biryani Friday would eat 38% of your remaining week 🍛. Split on Splitwise instead!",
            tone: "caution",
          };
        }

        if (safeDailyAllowance > 280) {
          return {
            note: `Day ${currentDay}: You're ₹${safeDailyAllowance - 220} ahead of pace! Tuck ₹100 into the Goa trip ✨`,
            tone: "praise",
          };
        }

        if (safeDailyAllowance < 150) {
          return {
            note: `Tight squeeze: ₹${safeDailyAllowance}/day left. Tapri chai is fine, avoid Swiggy surge delivery!`,
            tone: "caution",
          };
        }

        return {
          note: `Day ${currentDay}/30: Safe allowance is ₹${safeDailyAllowance}/day. Keep the 3-day streak going! 🌿`,
          tone: "tip",
        };
      },
    }),
    {
      name: "inkwell-finance-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        startBudget: state.startBudget,
        currentDay: state.currentDay,
        transactions: state.transactions,
        commitments: state.commitments,
        subscriptions: state.subscriptions,
        goals: state.goals,
        incomeEvents: state.incomeEvents,
        unexpectedEvents: state.unexpectedEvents,
        theme: state.theme,
        isLensActive: state.isLensActive,
        streakDays: state.streakDays,
        unlockedBadges: state.unlockedBadges,
      }),
    }
  )
);
