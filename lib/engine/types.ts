/**
 * INKWELL: Core Domain Types
 * Pure TypeScript definitions for the 30-day personal finance sketchbook engine.
 */

export type ExpenseCategory =
  | "Food & Dining"
  | "Transport & Commute"
  | "Entertainment & Gaming"
  | "Shopping & Personal"
  | "Bills & Utilities"
  | "Academics & Books"
  | "Health & Emergency"
  | "Other";

export type CommitmentCategory =
  | "Mobile & Internet"
  | "Transit Pass"
  | "Tuition / Course"
  | "Rent / Room Share"
  | "Other Fixed Due";

export type SubscriptionCategory =
  | "Streaming"
  | "Music"
  | "Productivity"
  | "Gaming"
  | "Cloud & Storage";

export type RiskLevel = "Safe" | "Watch" | "Danger";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  day: number; // Day 1 to 30
  category: ExpenseCategory;
  note?: string;
  isEssential?: boolean;
  upiRef?: string;
  createdAt: string;
}

export interface IncomeEvent {
  id: string;
  title: string;
  amount: number;
  day: number;
  category: "Stipend" | "Allowance" | "Freelance" | "Resale" | "Gift" | "Other";
  received: boolean;
}

export interface Commitment {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  isPaid: boolean;
  category: CommitmentCategory;
  notes?: string;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  cycle: "monthly" | "yearly";
  dueDay: number;
  active: boolean;
  category: SubscriptionCategory;
  cancellationDifficulty?: "easy" | "medium" | "hard";
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadlineDay: number;
  priority: "high" | "medium" | "low";
  emoji?: string;
  notes?: string;
}

export interface UnexpectedEvent {
  id: string;
  title: string;
  amount: number;
  day: number;
  severity: "low" | "medium" | "high";
  description: string;
  resolved: boolean;
  resolutionChoice?: "pay" | "defer" | "split" | "borrow_from_goal";
  deferredUntilDay?: number;
  borrowedFromGoalId?: string;
}

export interface SimulationDecision {
  id: string;
  type:
    | "one_off_purchase"
    | "new_subscription"
    | "cancel_subscription"
    | "habit_change"
    | "skip_commitment"
    | "goal_transfer"
    | "side_income"
    | "unexpected_expense";
  title: string;
  amount: number; // Positive = cost/reserve, negative = savings/income
  targetId?: string; // subscription ID, commitment ID, or goal ID
  frequency?: "once" | "daily_habit" | "recurring";
  notes?: string;
}

export interface Scenario {
  id: string;
  name: string;
  decisions: SimulationDecision[];
  createdAt: string;
}

export interface RiskFactor {
  title: string;
  impact: "high" | "medium" | "low";
  description: string;
  scoreContribution: number;
}

export interface RiskBreakdown {
  score: number; // 0 (Safe) to 100 (Extremely Danger)
  level: RiskLevel;
  topFactors: RiskFactor[];
  runwayShortfallDays: number;
  commitmentCoverageRatio: number;
  subscriptionLoadPercent: number;
  emergencyBufferCoverage: number;
}

export interface HealthBreakdown {
  score: number; // 0 to 100
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  subScores: {
    budgetAdherence: number; // max 25
    savingsProgress: number; // max 25
    riskControl: number; // max 20
    subscriptionHygiene: number; // max 15
    spendingConsistency: number; // max 15
  };
  keyRecommendation: string;
}

export interface GoalProjection {
  goalId: string;
  goalName: string;
  target: number;
  saved: number;
  percentComplete: number;
  projectedCompletionDay: number | null; // null if unreachable
  dailySavingsNeeded: number;
  isOnTrack: boolean;
  gapAmount: number;
}

export interface DayForecastPoint {
  day: number;
  actualBalance?: number;
  expectedBalance: number;
  bestCaseBalance: number;
  worstCaseBalance: number;
}

export interface DayState {
  currentDay: number;
  totalDays: number; // Default 30
  startBudget: number; // Default ₹10,000

  // Balances & Cash
  totalIncomeReceived: number;
  totalSpent: number;
  totalCommittedPaid: number;
  totalMovedToGoals: number;
  remainingBalance: number;

  // Reserved obligations
  unpaidCommitmentsTotal: number;
  subscriptionsDueTotal: number;
  plannedGoalsReserve: number;
  emergencyBuffer: number;
  totalReserved: number;

  // Safe Daily Allowance
  safeDailyAllowance: number;
  yesterdayAllowance: number;
  allowanceDelta: number; // Positive = increased, Negative = decreased

  // Runway & Projections
  weightedAvgDailySpend: number;
  runwayDays: number;
  daysRemaining: number;
  projectedDay30Balance: number;
  forecastPoints: DayForecastPoint[];

  // Health & Risk
  risk: RiskBreakdown;
  health: HealthBreakdown;
  goalProjections: GoalProjection[];

  // Overdraft Flag
  isOverdraft: boolean;
  overdraftAmount: number;
}

export interface SimulationDiff {
  before: DayState;
  after: DayState;
  deltas: {
    remainingBalance: number;
    safeDailyAllowance: number;
    projectedDay30Balance: number;
    healthScore: number;
    riskScore: number;
    runwayDays: number;
  };
  verdict: {
    headline: string;
    description: string;
    sentiment: "positive" | "warning" | "danger" | "neutral";
    tradeOffs: string[];
    alternatives: {
      title: string;
      savings: number;
      actionDescription: string;
    }[];
  };
}

export interface LedgerPageInfo {
  pageId:
    | "overview"
    | "spending"
    | "commitments"
    | "goals"
    | "simulator"
    | "forecast"
    | "health"
    | "report";
  title: string;
  chapterNumber: string;
  tabLabel: string;
  iconName: string;
}
