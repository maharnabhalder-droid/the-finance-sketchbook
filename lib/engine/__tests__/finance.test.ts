import { describe, it, expect } from "vitest";
import {
  computeDayState,
  formatINR,
  simulateScenario,
  EngineInput,
} from "../finance";
import { Transaction, Commitment, Subscription, SavingsGoal } from "../types";
import { INITIAL_SEED_DATA } from "../../seed/demo-data";
import { GET as getSeedRoute } from "../../../app/api/seed/route";
import { GET as getEventsRoute, POST as postEventsRoute } from "../../../app/api/events/route";

describe("INKWELL Finance Engine", () => {
  const mockCommitments: Commitment[] = [
    {
      id: "comm_1",
      name: "Jio 5G Recharge",
      amount: 239,
      dueDay: 18,
      isPaid: false,
      category: "Mobile & Internet",
    },
    {
      id: "comm_2",
      name: "Metro Monthly Card",
      amount: 600,
      dueDay: 20,
      isPaid: false,
      category: "Transit Pass",
    },
  ];

  const mockSubscriptions: Subscription[] = [
    {
      id: "sub_1",
      name: "Spotify Student",
      price: 59,
      cycle: "monthly",
      dueDay: 15,
      active: true,
      category: "Music",
    },
    {
      id: "sub_2",
      name: "Netflix Mobile",
      price: 149,
      cycle: "monthly",
      dueDay: 22,
      active: true,
      category: "Streaming",
    },
  ];

  const mockGoals: SavingsGoal[] = [
    {
      id: "goal_1",
      name: "Goa Weekend Trip",
      target: 2500,
      saved: 1000,
      deadlineDay: 28,
      priority: "high",
      emoji: "🏖️",
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: "tx_1",
      title: "Chai & Samosa Canteen",
      amount: 60,
      day: 1,
      category: "Food & Dining",
      createdAt: "2026-10-01T10:00:00Z",
    },
    {
      id: "tx_2",
      title: "Swiggy Biryani Dinner",
      amount: 320,
      day: 2,
      category: "Food & Dining",
      createdAt: "2026-10-02T20:00:00Z",
    },
  ];

  describe("Indian Currency Formatter (en-IN)", () => {
    it("formats amounts in standard Indian rupee notation without decimals", () => {
      expect(formatINR(10000)).toMatch(/₹\s?10,000/);
      expect(formatINR(150000)).toMatch(/₹\s?1,50,000/);
      expect(formatINR(0)).toMatch(/₹\s?0/);
    });

    it("formats negative amounts with leading minus", () => {
      expect(formatINR(-540)).toMatch(/-₹\s?540/);
    });
  });

  describe("Balance & Safe Daily Allowance Calculations", () => {
    it("computes remaining balance correctly on Day 3", () => {
      const input: EngineInput = {
        currentDay: 3,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const state = computeDayState(input);

      expect(state.totalSpent).toBe(380);
      expect(state.remainingBalance).toBe(8620);
      expect(state.isOverdraft).toBe(false);
    });

    it("calculates reserved funds including unpaid commitments, subscriptions and emergency buffer", () => {
      const input: EngineInput = {
        currentDay: 3,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const state = computeDayState(input);

      expect(state.unpaidCommitmentsTotal).toBe(839);
      expect(state.subscriptionsDueTotal).toBe(208);
      expect(state.emergencyBuffer).toBe(1000);
      expect(state.totalReserved).toBe(2047);
      expect(state.safeDailyAllowance).toBe(Math.round(6573 / 28));
      expect(state.safeDailyAllowance).toBeGreaterThan(200);
    });
  });

  describe("Risk Score & Overdraft Handling", () => {
    it("rates financial risk as Safe when runway is comfortable and buffer intact", () => {
      const input: EngineInput = {
        currentDay: 5,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const state = computeDayState(input);
      expect(state.risk.level).toBe("Safe");
      expect(state.risk.score).toBeLessThan(35);
    });

    it("flags Danger when account is driven into overdraft", () => {
      const heavySpendTransactions: Transaction[] = [
        ...mockTransactions,
        {
          id: "huge_tx",
          title: "New Smartphone Purchase",
          amount: 12000,
          day: 4,
          category: "Shopping & Personal",
          createdAt: "2026-10-04T12:00:00Z",
        },
      ];

      const input: EngineInput = {
        currentDay: 5,
        startBudget: 10000,
        transactions: heavySpendTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const state = computeDayState(input);
      expect(state.isOverdraft).toBe(true);
      expect(state.remainingBalance).toBeLessThan(0);
      expect(state.risk.level).toBe("Danger");
      expect(state.risk.score).toBe(100);
    });
  });

  describe("Decision Simulator & Ripple Effects", () => {
    it("simulates a ₹1,500 weekend party and reveals the exact ripple on daily allowance", () => {
      const input: EngineInput = {
        currentDay: 10,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const diff = simulateScenario(input, [
        {
          id: "dec_1",
          type: "one_off_purchase",
          title: "Weekend Party & Drinks",
          amount: 1500,
        },
      ]);

      expect(diff.deltas.remainingBalance).toBe(-1500);
      expect(diff.deltas.safeDailyAllowance).toBeLessThan(0);
      expect(diff.verdict.tradeOffs.length).toBeGreaterThan(0);
      expect(diff.verdict.alternatives.length).toBeGreaterThan(0);
    });

    it("simulates cancelling a subscription and proves positive runway extension", () => {
      const input: EngineInput = {
        currentDay: 10,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      };

      const diff = simulateScenario(input, [
        {
          id: "dec_cancel",
          type: "cancel_subscription",
          title: "Cancel Netflix",
          amount: 149,
          targetId: "sub_2",
        },
      ]);

      expect(diff.after.subscriptionsDueTotal).toBeLessThan(diff.before.subscriptionsDueTotal);
      expect(diff.deltas.safeDailyAllowance).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Characterization & Determinism Locks (Golden Rule 3)", () => {
    it("locks initial demo state calculations to prevent regression", () => {
      const state = computeDayState({
        currentDay: INITIAL_SEED_DATA.currentDay,
        startBudget: INITIAL_SEED_DATA.startBudget,
        transactions: INITIAL_SEED_DATA.transactions,
        commitments: INITIAL_SEED_DATA.commitments,
        subscriptions: INITIAL_SEED_DATA.subscriptions,
        goals: INITIAL_SEED_DATA.goals,
        incomeEvents: INITIAL_SEED_DATA.incomeEvents,
        unexpectedEvents: INITIAL_SEED_DATA.unexpectedEvents,
      });

      // Verify seed state determinism
      expect(state.currentDay).toBe(12);
      expect(state.totalDays).toBe(30);
      expect(state.startBudget).toBe(10000);
      expect(state.remainingBalance).toBeGreaterThan(0);
      expect(state.safeDailyAllowance).toBeGreaterThan(0);
      expect(state.runwayDays).toBeGreaterThan(0);
      expect(state.forecastPoints.length).toBe(30);
      expect(state.goalProjections.length).toBeGreaterThanOrEqual(1);
      expect(state.health.score).toBeGreaterThan(0);
      expect(state.health.score).toBeLessThanOrEqual(100);
      expect(["Safe", "Watch", "Danger"]).toContain(state.risk.level);
    });

    it("locks 3-cone forecast trajectory monotonicity", () => {
      const state = computeDayState({
        currentDay: 12,
        startBudget: 10000,
        transactions: mockTransactions,
        commitments: mockCommitments,
        subscriptions: mockSubscriptions,
        goals: mockGoals,
      });

      const day30Forecast = state.forecastPoints[29];
      expect(day30Forecast.day).toBe(30);
      // Best case must be >= expected case >= worst case
      expect(day30Forecast.bestCaseBalance).toBeGreaterThanOrEqual(day30Forecast.expectedBalance);
      expect(day30Forecast.expectedBalance).toBeGreaterThanOrEqual(day30Forecast.worstCaseBalance);
    });
  });

  describe("API Route Handlers Smoke Tests", () => {
    it("GET /api/seed responds with HTTP 200 and demo data", async () => {
      const response = await getSeedRoute();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.status).toBe("success");
      expect(json.data.startBudget).toBe(10000);
      expect(json.data.currentDay).toBe(12);
    });

    it("GET /api/events responds with unexpected events list", async () => {
      const response = await getEventsRoute();
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.status).toBe("success");
      expect(Array.isArray(json.events)).toBe(true);
    });

    it("POST /api/events creates an event simulation", async () => {
      const mockReq = new Request("http://localhost:3000/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: "Spilled Coffee on Textbook",
          amount: 450,
        }),
      });

      const response = await postEventsRoute(mockReq);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.status).toBe("success");
      expect(json.event.title).toBe("Spilled Coffee on Textbook");
      expect(json.event.amount).toBe(450);
    });
  });
});
