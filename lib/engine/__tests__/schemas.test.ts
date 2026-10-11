import { describe, it, expect } from "vitest";
import {
  validateTransaction,
  validateSavingsGoal,
  validateSubscription,
  validateSimulationDecision,
} from "../schemas";
import { FINANCE_CONFIG } from "../../config/constants";

describe("Data Boundary Validation & Configuration Schemas", () => {
  describe("Zod Validation at Data Boundaries", () => {
    it("accepts valid transaction input and rejects invalid amounts or categories", () => {
      const valid = validateTransaction({
        title: "Swiggy Bowl",
        amount: 220,
        day: 12,
        category: "Food & Dining",
      });
      expect(valid.success).toBe(true);

      const invalidAmount = validateTransaction({
        title: "Test",
        amount: -50,
        day: 12,
        category: "Food & Dining",
      });
      expect(invalidAmount.success).toBe(false);

      const invalidCategory = validateTransaction({
        title: "Test",
        amount: 100,
        day: 12,
        category: "NonExistentCategory",
      });
      expect(invalidCategory.success).toBe(false);

      const validWithSentiment = validateTransaction({
        title: "Cold Brew Treat",
        amount: 140,
        day: 12,
        category: "Food & Dining",
        sentiment: "worth_it",
      });
      expect(validWithSentiment.success).toBe(true);

      const invalidSentiment = validateTransaction({
        title: "Test",
        amount: 100,
        day: 12,
        category: "Food & Dining",
        sentiment: "invalid_feeling" as unknown as "worth_it",
      });
      expect(invalidSentiment.success).toBe(false);
    });

    it("validates savings goal constraints and priority thresholds", () => {
      const validGoal = validateSavingsGoal({
        name: "Laptop Repair Fund",
        target: 4000,
        deadlineDay: 25,
        priority: "high",
      });
      expect(validGoal.success).toBe(true);

      const invalidDeadline = validateSavingsGoal({
        name: "Test",
        target: 1000,
        deadlineDay: 35, // exceeds 30
        priority: "medium",
      });
      expect(invalidDeadline.success).toBe(false);
    });

    it("validates simulation decision types", () => {
      const validDecision = validateSimulationDecision({
        type: "one_off_purchase",
        title: "New Jacket",
        amount: 1200,
      });
      expect(validDecision.success).toBe(true);

      const invalidDecision = validateSimulationDecision({
        type: "invalid_type",
        title: "Test",
        amount: 50,
      });
      expect(invalidDecision.success).toBe(false);
    });
  });

  describe("Configuration Constants Integrity", () => {
    it("ensures health pillars sum exactly to 100 points", () => {
      const sum = Object.values(FINANCE_CONFIG.HEALTH_PILLARS).reduce(
        (acc, p) => acc + p.max,
        0
      );
      expect(sum).toBe(100);
    });

    it("verifies risk penalty thresholds are coherent", () => {
      expect(FINANCE_CONFIG.RISK.SAFE_THRESHOLD).toBeLessThan(
        FINANCE_CONFIG.RISK.WATCH_THRESHOLD
      );
      expect(FINANCE_CONFIG.RISK.WATCH_THRESHOLD).toBeLessThan(
        FINANCE_CONFIG.RISK.DANGER_THRESHOLD
      );
    });
  });
});
