/**
 * INKWELL: Centralized Domain Constants & Financial Thresholds
 * Single source of truth for engine weights, defaults, and boundary constraints.
 */

export const FINANCE_CONFIG = {
  // Cycle defaults
  DEFAULT_START_BUDGET: 10000,
  DEFAULT_TOTAL_DAYS: 30,
  EMERGENCY_BUFFER_RATIO: 0.1, // 10% of start budget
  MIN_DISCRETIONARY_BASELINE: 150, // Minimum suggested safe daily allowance in INR

  // Risk Score Thresholds (0 - 100)
  RISK: {
    SAFE_THRESHOLD: 35,
    WATCH_THRESHOLD: 69,
    DANGER_THRESHOLD: 70,
    MAX_SHORTFALL_PENALTY: 30,
    MAX_VOLATILITY_PENALTY: 20,
    MAX_COMMITMENT_PENALTY: 20,
    MAX_SUBSCRIPTION_PENALTY: 15,
    MAX_BUFFER_PENALTY: 15,
  },

  // Health Score Pillars & Weights (Sum = 100)
  HEALTH_PILLARS: {
    BUDGET_ADHERENCE: { max: 25, weight: 0.25, name: "Budget Adherence" },
    SAVINGS_PROGRESS: { max: 25, weight: 0.25, name: "Savings Pace" },
    RISK_CONTROL: { max: 20, weight: 0.2, name: "Runway & Risk Cushion" },
    SUBSCRIPTION_HYGIENE: { max: 15, weight: 0.15, name: "Subscription Hygiene" },
    SPENDING_CONSISTENCY: { max: 15, weight: 0.15, name: "Spending Consistency" },
  },

  // Storage and versioning
  STORAGE_KEY: "inkwell-finance-storage",
  STORE_VERSION: 1,

  // App Metadata
  APP_NAME: "INKWELL",
  TAGLINE: "The Personal Finance Sketchbook for Gen Z",
  LIVE_URL: "https://the-finance-sketchbook.vercel.app",
} as const;
