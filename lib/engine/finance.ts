/**
 * INKWELL: Pure Finance Calculation Engine
 * 
 * Single source of truth for:
 * 1. Remaining balance & reserved cash breakdown
 * 2. Safe Daily Allowance calculation (recalculated dynamically)
 * 3. Weighted recency average daily spend
 * 4. Runway calculation vs days remaining
 * 5. Multi-factor Financial RISK Score (0-100) -> Safe / Watch / Danger wax seal
 * 6. Weighted Financial HEALTH Score (0-100) -> A+ to F grade
 * 7. Goal completion projections & gap per day
 * 8. Month-end 3-cone forecast (Best, Expected, Worst)
 * 9. Interactive "What if?" Decision Simulator with ripple diffing
 */

import {
  DayState,
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
  IncomeEvent,
  UnexpectedEvent,
  RiskBreakdown,
  HealthBreakdown,
  GoalProjection,
  DayForecastPoint,
  SimulationDecision,
  SimulationDiff,
  RiskFactor,
} from "./types";

/**
 * Format currency with official Indian Numbering System (e.g. ₹10,000, ₹1,50,000)
 */
export function formatINR(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

export interface EngineInput {
  currentDay: number; // 1 to 30
  startBudget?: number; // Default 10000
  transactions: Transaction[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  goals: SavingsGoal[];
  incomeEvents?: IncomeEvent[];
  unexpectedEvents?: UnexpectedEvent[];
  yesterdayAllowanceOverride?: number;
}

/**
 * Main engine function: derives the comprehensive financial state of the notebook
 */
export function computeDayState(input: EngineInput): DayState {
  const currentDay = Math.min(30, Math.max(1, input.currentDay));
  const totalDays = 30;
  const startBudget = input.startBudget ?? 10000;
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);

  // 1. Incomes received up to currentDay
  const totalIncomeReceived = (input.incomeEvents || [])
    .filter((e) => e.day <= currentDay && e.received)
    .reduce((sum, e) => sum + e.amount, 0);

  // 2. Transactions spent up to currentDay
  const pastTransactions = input.transactions.filter((t) => t.day <= currentDay);
  const totalSpent = pastTransactions.reduce((sum, t) => sum + t.amount, 0);

  // 3. Paid Commitments
  const totalCommittedPaid = input.commitments
    .filter((c) => c.isPaid)
    .reduce((sum, c) => sum + c.amount, 0);

  // 4. Money moved to Savings Goals
  const totalMovedToGoals = input.goals.reduce((sum, g) => sum + g.saved, 0);

  // 5. Remaining Cash Balance
  const rawBalance =
    startBudget + totalIncomeReceived - totalSpent - totalCommittedPaid - totalMovedToGoals;
  const isOverdraft = rawBalance < 0;
  const overdraftAmount = isOverdraft ? Math.abs(rawBalance) : 0;
  const remainingBalance = rawBalance;

  // 6. Reserved Obligations before Day 30
  // Unpaid commitments due on or before day 30
  const unpaidCommitmentsTotal = input.commitments
    .filter((c) => !c.isPaid && c.dueDay <= totalDays)
    .reduce((sum, c) => sum + c.amount, 0);

  // Active subscriptions due between currentDay and Day 30
  const subscriptionsDueTotal = input.subscriptions
    .filter((s) => s.active && s.dueDay >= currentDay && s.dueDay <= totalDays)
    .reduce((sum, s) => sum + s.price, 0);

  // Planned goal contributions remaining (target - saved) if deadline <= totalDays
  const plannedGoalsReserve = input.goals
    .filter((g) => g.deadlineDay <= totalDays && g.saved < g.target)
    .reduce((sum, g) => sum + Math.max(0, g.target - g.saved), 0);

  // Recommended 10% emergency buffer based on starting budget
  const emergencyBuffer = Math.round(startBudget * 0.1); // ₹1,000 for ₹10,000 budget

  const totalReserved =
    unpaidCommitmentsTotal + subscriptionsDueTotal + emergencyBuffer;

  // 7. SAFE DAILY ALLOWANCE
  // Formula: (Remaining Balance - Reserved Money) / Days Left
  const unreservedCash = Math.max(0, remainingBalance - totalReserved);
  const safeDailyAllowance = Math.max(0, Math.round(unreservedCash / daysRemaining));

  // Allowance delta vs yesterday
  const yesterdayAllowance =
    input.yesterdayAllowanceOverride ??
    (currentDay === 1
      ? safeDailyAllowance
      : Math.round(unreservedCash / Math.max(1, daysRemaining + 1)));
  const allowanceDelta = safeDailyAllowance - yesterdayAllowance;

  // 8. Weighted Average Daily Spend
  // Recency weighting: last 5 days have 2x weight over older days
  let weightedSpendSum = 0;
  let weightSum = 0;

  for (let d = 1; d <= currentDay; d++) {
    const daySpend = pastTransactions
      .filter((t) => t.day === d)
      .reduce((sum, t) => sum + t.amount, 0);
    const weight = d >= currentDay - 4 ? 2.0 : 1.0;
    weightedSpendSum += daySpend * weight;
    weightSum += weight;
  }

  const weightedAvgDailySpend =
    weightSum > 0 ? Math.round(weightedSpendSum / weightSum) : 0;

  // 9. Runway (Days until zero balance)
  const effectiveBurn = Math.max(10, weightedAvgDailySpend);
  const runwayDays =
    remainingBalance > 0
      ? Math.round((remainingBalance / effectiveBurn) * 10) / 10
      : 0;

  // 10. Day-30 Balance Projections
  const upcomingFixedCosts = unpaidCommitmentsTotal + subscriptionsDueTotal;
  const projectedDay30Balance = Math.round(
    remainingBalance - weightedAvgDailySpend * (daysRemaining - 1) - upcomingFixedCosts
  );

  // Forecast Curve Points (Days 1 to 30)
  const forecastPoints = generateForecastPoints({
    currentDay,
    totalDays,
    startBudget,
    pastTransactions,
    remainingBalance,
    weightedAvgDailySpend,
    upcomingFixedCosts,
  });

  // 11. Goal Projections
  const goalProjections = computeGoalProjections(input.goals, currentDay, safeDailyAllowance);

  // 12. Financial Risk Breakdown
  const risk = computeRiskScore({
    remainingBalance,
    totalReserved,
    emergencyBuffer,
    unpaidCommitmentsTotal,
    subscriptionsDueTotal,
    startBudget,
    runwayDays,
    daysRemaining,
    pastTransactions,
    currentDay,
  });

  // 13. Financial Health Breakdown
  const health = computeHealthScore({
    currentDay,
    pastTransactions,
    safeDailyAllowance,
    goalProjections,
    riskScore: risk.score,
    subscriptions: input.subscriptions,
    startBudget,
    remainingBalance,
  });

  return {
    currentDay,
    totalDays,
    startBudget,
    totalIncomeReceived,
    totalSpent,
    totalCommittedPaid,
    totalMovedToGoals,
    remainingBalance,
    unpaidCommitmentsTotal,
    subscriptionsDueTotal,
    plannedGoalsReserve,
    emergencyBuffer,
    totalReserved,
    safeDailyAllowance,
    yesterdayAllowance,
    allowanceDelta,
    weightedAvgDailySpend,
    runwayDays,
    daysRemaining,
    projectedDay30Balance,
    forecastPoints,
    risk,
    health,
    goalProjections,
    isOverdraft,
    overdraftAmount,
  };
}

/**
 * Calculates Multi-Factor Financial Risk (0 - 100) & Wax Seal
 */
function computeRiskScore(params: {
  remainingBalance: number;
  totalReserved: number;
  emergencyBuffer: number;
  unpaidCommitmentsTotal: number;
  subscriptionsDueTotal: number;
  startBudget: number;
  runwayDays: number;
  daysRemaining: number;
  pastTransactions: Transaction[];
  currentDay: number;
}): RiskBreakdown {
  const {
    remainingBalance,
    totalReserved,
    emergencyBuffer,
    unpaidCommitmentsTotal,
    subscriptionsDueTotal,
    startBudget,
    runwayDays,
    daysRemaining,
    pastTransactions,
    currentDay,
  } = params;

  let score = 0;
  const factors: RiskFactor[] = [];

  // Overdraft = 100 Risk immediately
  if (remainingBalance < 0) {
    return {
      score: 100,
      level: "Danger",
      topFactors: [
        {
          title: "Account in Overdraft",
          impact: "high",
          description: `Balance is negative by ${formatINR(Math.abs(remainingBalance))}. Immediate deposit needed.`,
          scoreContribution: 100,
        },
      ],
      runwayShortfallDays: daysRemaining,
      commitmentCoverageRatio: 0,
      subscriptionLoadPercent: (subscriptionsDueTotal / startBudget) * 100,
      emergencyBufferCoverage: 0,
    };
  }

  // 1. Runway Shortfall (max 35 pts)
  const runwayShortfall = Math.max(0, daysRemaining - runwayDays);
  if (runwayShortfall > 0) {
    const runwayContrib = Math.min(35, Math.round((runwayShortfall / daysRemaining) * 35));
    score += runwayContrib;
    factors.push({
      title: "Runway Shortfall",
      impact: runwayContrib > 20 ? "high" : "medium",
      description: `At current burn rate, funds dry up ${runwayShortfall.toFixed(1)} days before Day 30.`,
      scoreContribution: runwayContrib,
    });
  }

  // 2. Commitment Coverage (max 25 pts)
  const upcomingBills = unpaidCommitmentsTotal + subscriptionsDueTotal;
  const commitmentCoverageRatio =
    upcomingBills > 0 ? remainingBalance / upcomingBills : 2.0;

  if (commitmentCoverageRatio < 1.0) {
    const billDeficit = upcomingBills - remainingBalance;
    score += 25;
    factors.push({
      title: "Uncovered Fixed Dues",
      impact: "high",
      description: `Balance cannot cover remaining ₹${upcomingBills} in fixed commitments (short by ${formatINR(billDeficit)}).`,
      scoreContribution: 25,
    });
  } else if (commitmentCoverageRatio < 1.3) {
    score += 15;
    factors.push({
      title: "Tight Bill Coverage",
      impact: "medium",
      description: `Only ${commitmentCoverageRatio.toFixed(1)}x coverage over upcoming fixed dues.`,
      scoreContribution: 15,
    });
  }

  // 3. Emergency Buffer Penetration (max 20 pts)
  const emergencyBufferCoverage =
    emergencyBuffer > 0 ? Math.max(0, remainingBalance - upcomingBills) / emergencyBuffer : 1;
  if (emergencyBufferCoverage < 0.5) {
    score += 20;
    factors.push({
      title: "Buffer Depleted",
      impact: "high",
      description: `Emergency reserve is nearly empty. Any unexpected expense will force an overdraft.`,
      scoreContribution: 20,
    });
  } else if (emergencyBufferCoverage < 1.0) {
    score += 10;
    factors.push({
      title: "Buffer Partially Dipped",
      impact: "low",
      description: `Buffer is at ${(emergencyBufferCoverage * 100).toFixed(0)}% of target.`,
      scoreContribution: 10,
    });
  }

  // 4. Daily Spend Volatility (max 10 pts)
  if (currentDay >= 3) {
    const dailySpends = Array.from({ length: currentDay }, (_, i) => {
      const d = i + 1;
      return pastTransactions
        .filter((t) => t.day === d)
        .reduce((sum, t) => sum + t.amount, 0);
    });
    const mean = dailySpends.reduce((a, b) => a + b, 0) / currentDay;
    const variance =
      dailySpends.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / currentDay;
    const stdDev = Math.sqrt(variance);

    if (stdDev > mean * 0.9 && mean > 50) {
      score += 10;
      factors.push({
        title: "Erratic Spending Spikes",
        impact: "low",
        description: `High volatility between no-spend days and big impulsive splurges.`,
        scoreContribution: 10,
      });
    }
  }

  // 5. Subscription Load (max 10 pts)
  const subLoadPercent = (subscriptionsDueTotal / startBudget) * 100;
  if (subLoadPercent > 10) {
    score += 10;
    factors.push({
      title: "Heavy Subscription Load",
      impact: "medium",
      description: `Recurring subs consume ${subLoadPercent.toFixed(1)}% of your monthly budget.`,
      scoreContribution: 10,
    });
  }

  const finalScore = Math.min(100, Math.max(0, score));

  // Determine wax seal level
  let level: "Safe" | "Watch" | "Danger" = "Safe";
  if (finalScore >= 65) {
    level = "Danger";
  } else if (finalScore >= 35) {
    level = "Watch";
  }

  // Sort factors by contribution
  factors.sort((a, b) => b.scoreContribution - a.scoreContribution);

  return {
    score: finalScore,
    level,
    topFactors: factors.slice(0, 3),
    runwayShortfallDays: Math.round(runwayShortfall * 10) / 10,
    commitmentCoverageRatio: Math.round(commitmentCoverageRatio * 100) / 100,
    subscriptionLoadPercent: Math.round(subLoadPercent * 10) / 10,
    emergencyBufferCoverage: Math.round(emergencyBufferCoverage * 100) / 100,
  };
}

/**
 * Calculates 0-100 Weighted Financial Health Score & Letter Grade
 */
function computeHealthScore(params: {
  currentDay: number;
  pastTransactions: Transaction[];
  safeDailyAllowance: number;
  goalProjections: GoalProjection[];
  riskScore: number;
  subscriptions: Subscription[];
  startBudget: number;
  remainingBalance: number;
}): HealthBreakdown {
  const {
    currentDay,
    pastTransactions,
    safeDailyAllowance,
    goalProjections,
    riskScore,
    subscriptions,
    startBudget,
    remainingBalance,
  } = params;

  if (remainingBalance < 0) {
    return {
      score: 12,
      grade: "F",
      subScores: {
        budgetAdherence: 0,
        savingsProgress: 5,
        riskControl: 0,
        subscriptionHygiene: 4,
        spendingConsistency: 3,
      },
      keyRecommendation: "Curb non-essential spends immediately to bring account out of overdraft.",
    };
  }

  // 1. Budget Adherence (max 25)
  // Check how many days spend was <= safeDailyAllowance
  let underAllowanceDays = 0;
  for (let d = 1; d <= currentDay; d++) {
    const daySpend = pastTransactions
      .filter((t) => t.day === d)
      .reduce((sum, t) => sum + t.amount, 0);
    if (daySpend <= Math.max(150, safeDailyAllowance * 1.15)) {
      underAllowanceDays++;
    }
  }
  const adherenceRatio = currentDay > 0 ? underAllowanceDays / currentDay : 1.0;
  const budgetAdherence = Math.round(adherenceRatio * 25);

  // 2. Savings Progress (max 25)
  let savingsProgress = 20;
  if (goalProjections.length > 0) {
    const onTrackGoals = goalProjections.filter((g) => g.isOnTrack).length;
    savingsProgress = Math.round((onTrackGoals / goalProjections.length) * 25);
  }

  // 3. Risk Control (max 20)
  // Inverse of risk score
  const riskControl = Math.round((1 - riskScore / 100) * 20);

  // 4. Subscription Hygiene (max 15)
  const activeSubs = subscriptions.filter((s) => s.active);
  const totalSubCost = activeSubs.reduce((sum, s) => sum + s.price, 0);
  const subPercent = (totalSubCost / startBudget) * 100;
  let subscriptionHygiene = 15;
  if (subPercent > 12) subscriptionHygiene = 5;
  else if (subPercent > 7) subscriptionHygiene = 10;

  // 5. Spending Consistency (max 15)
  let spendingConsistency = 13;
  if (currentDay >= 3) {
    const dailySpends = Array.from({ length: currentDay }, (_, i) => {
      const d = i + 1;
      return pastTransactions
        .filter((t) => t.day === d)
        .reduce((sum, t) => sum + t.amount, 0);
    });
    const maxSpend = Math.max(...dailySpends, 0);
    if (maxSpend > safeDailyAllowance * 2.5) {
      spendingConsistency = 8;
    }
  }

  const totalScore = Math.min(
    100,
    Math.max(
      0,
      budgetAdherence + savingsProgress + riskControl + subscriptionHygiene + spendingConsistency
    )
  );

  let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "B";
  if (totalScore >= 90) grade = "A+";
  else if (totalScore >= 80) grade = "A";
  else if (totalScore >= 68) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 35) grade = "D";
  else grade = "F";

  // Plain-language tip that would raise score most
  let keyRecommendation = "Keep daily spending under safe allowance to maintain steady runway.";
  if (budgetAdherence < 15) {
    keyRecommendation = "Keep tomorrow's spending strictly below your daily allowance to boost Budget Adherence.";
  } else if (riskControl < 10) {
    keyRecommendation = "Hold off on discretionary splurges until your bill buffer recovers.";
  } else if (savingsProgress < 15) {
    keyRecommendation = "Tuck ₹150 into your savings goal to get back on track for the target deadline.";
  } else if (subscriptionHygiene < 10) {
    keyRecommendation = "Audit your recurring streaming apps — canceling one unused sub saves ₹150+ monthly.";
  }

  return {
    score: totalScore,
    grade,
    subScores: {
      budgetAdherence,
      savingsProgress,
      riskControl,
      subscriptionHygiene,
      spendingConsistency,
    },
    keyRecommendation,
  };
}

/**
 * Computes Goal Projections: projected finish day & daily gap
 */
function computeGoalProjections(
  goals: SavingsGoal[],
  currentDay: number,
  safeDailyAllowance: number
): GoalProjection[] {
  return goals.map((goal) => {
    const remainingTarget = Math.max(0, goal.target - goal.saved);
    const percentComplete =
      goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 100;
    const daysLeftToDeadline = Math.max(1, goal.deadlineDay - currentDay);
    const dailySavingsNeeded = Math.round(remainingTarget / daysLeftToDeadline);

    // Projected completion day assuming 20% of safe allowance can be set aside
    const estimatedDailyContribution = Math.max(25, safeDailyAllowance * 0.2);
    const daysNeededAtPace = Math.ceil(remainingTarget / estimatedDailyContribution);
    const projectedCompletionDay =
      remainingTarget === 0
        ? currentDay
        : currentDay + daysNeededAtPace <= 30
        ? currentDay + daysNeededAtPace
        : null;

    const isOnTrack =
      percentComplete >= 100 ||
      (projectedCompletionDay !== null && projectedCompletionDay <= goal.deadlineDay);

    return {
      goalId: goal.id,
      goalName: goal.name,
      target: goal.target,
      saved: goal.saved,
      percentComplete,
      projectedCompletionDay,
      dailySavingsNeeded,
      isOnTrack,
      gapAmount: remainingTarget,
    };
  });
}

/**
 * Generates 30-day forecast curves with 3 cones: Best, Expected, Worst
 */
function generateForecastPoints(params: {
  currentDay: number;
  totalDays: number;
  startBudget: number;
  pastTransactions: Transaction[];
  remainingBalance: number;
  weightedAvgDailySpend: number;
  upcomingFixedCosts: number;
}): DayForecastPoint[] {
  const {
    currentDay,
    totalDays,
    startBudget,
    pastTransactions,
    remainingBalance,
    weightedAvgDailySpend,
    upcomingFixedCosts,
  } = params;

  const points: DayForecastPoint[] = [];
  let runningActual = startBudget;

  // Past days: record actual spend trajectory
  for (let d = 1; d <= currentDay; d++) {
    const daySpend = pastTransactions
      .filter((t) => t.day === d)
      .reduce((sum, t) => sum + t.amount, 0);
    runningActual -= daySpend;

    points.push({
      day: d,
      actualBalance: Math.max(0, runningActual),
      expectedBalance: Math.max(0, runningActual),
      bestCaseBalance: Math.max(0, runningActual),
      worstCaseBalance: Math.max(0, runningActual),
    });
  }

  // Future days: project cones
  const remainingDays = totalDays - currentDay;
  if (remainingDays <= 0) return points;

  const dailyFixedDues = upcomingFixedCosts / Math.max(1, remainingDays);

  let curExpected = remainingBalance;
  let curBest = remainingBalance;
  let curWorst = remainingBalance;

  for (let d = currentDay + 1; d <= totalDays; d++) {
    // Expected: current weighted burn
    curExpected -= weightedAvgDailySpend + dailyFixedDues;

    // Best Case: disciplined spend (20% lower burn)
    curBest -= weightedAvgDailySpend * 0.75 + dailyFixedDues;

    // Worst Case: unexpected friction + splurges (30% higher burn)
    curWorst -= weightedAvgDailySpend * 1.35 + dailyFixedDues;

    points.push({
      day: d,
      expectedBalance: Math.round(Math.max(-2000, curExpected)),
      bestCaseBalance: Math.round(Math.max(-1000, curBest)),
      worstCaseBalance: Math.round(Math.max(-3000, curWorst)),
    });
  }

  return points;
}

/**
 * THE DECISION SIMULATOR CORE
 * Applies stacked hypothetical decisions onto a state and computes the ripple effect diff.
 */
export function simulateScenario(
  baseInput: EngineInput,
  decisions: SimulationDecision[]
): SimulationDiff {
  const beforeState = computeDayState(baseInput);

  // Clone inputs for simulation
  const simTransactions = [...baseInput.transactions];
  const simCommitments = baseInput.commitments.map((c) => ({ ...c }));
  const simSubscriptions = baseInput.subscriptions.map((s) => ({ ...s }));
  const simGoals = baseInput.goals.map((g) => ({ ...g }));
  const simIncome = [...(baseInput.incomeEvents || [])];
  const simUnexpected = [...(baseInput.unexpectedEvents || [])];

  let simulatedExtraIncome = 0;
  let totalCostImpact = 0;

  // Apply each decision
  for (const dec of decisions) {
    switch (dec.type) {
      case "one_off_purchase":
        simTransactions.push({
          id: `sim_tx_${dec.id}`,
          title: `[Simulated] ${dec.title}`,
          amount: dec.amount,
          day: baseInput.currentDay,
          category: "Shopping & Personal",
          createdAt: new Date().toISOString(),
        });
        totalCostImpact += dec.amount;
        break;

      case "new_subscription":
        simSubscriptions.push({
          id: `sim_sub_${dec.id}`,
          name: dec.title,
          price: dec.amount,
          cycle: "monthly",
          dueDay: Math.min(30, baseInput.currentDay + 5),
          active: true,
          category: "Streaming",
        });
        totalCostImpact += dec.amount;
        break;

      case "cancel_subscription":
        if (dec.targetId) {
          const sub = simSubscriptions.find((s) => s.id === dec.targetId);
          if (sub) {
            sub.active = false;
            totalCostImpact -= sub.price;
          }
        }
        break;

      case "habit_change": {
        // e.g. amount = -1200 means saving ₹1200 across remaining days
        const daysLeft = Math.max(1, 30 - baseInput.currentDay);
        const dailyImpact = dec.amount / daysLeft;
        // Adjust transaction simulation by adding an offset transaction
        simTransactions.push({
          id: `sim_habit_${dec.id}`,
          title: `[Habit Change] ${dec.title}`,
          amount: dec.amount,
          day: baseInput.currentDay,
          category: "Food & Dining",
          createdAt: new Date().toISOString(),
        });
        totalCostImpact += dec.amount;
        break;
      }

      case "skip_commitment":
        if (dec.targetId) {
          const commIndex = simCommitments.findIndex((c) => c.id === dec.targetId);
          if (commIndex >= 0) {
            // Push dueDay past Day 30 to simulate deferral
            simCommitments[commIndex].dueDay = 35;
          }
        }
        break;

      case "goal_transfer":
        if (dec.targetId) {
          const goal = simGoals.find((g) => g.id === dec.targetId);
          if (goal) {
            goal.saved = Math.max(0, goal.saved + dec.amount);
          }
        }
        break;

      case "side_income":
        simIncome.push({
          id: `sim_inc_${dec.id}`,
          title: dec.title,
          amount: dec.amount,
          day: baseInput.currentDay,
          category: "Freelance",
          received: true,
        });
        simulatedExtraIncome += dec.amount;
        break;

      case "unexpected_expense":
        simTransactions.push({
          id: `sim_unexp_${dec.id}`,
          title: `[Unexpected] ${dec.title}`,
          amount: dec.amount,
          day: baseInput.currentDay,
          category: "Health & Emergency",
          createdAt: new Date().toISOString(),
        });
        totalCostImpact += dec.amount;
        break;
    }
  }

  const afterState = computeDayState({
    ...baseInput,
    transactions: simTransactions,
    commitments: simCommitments,
    subscriptions: simSubscriptions,
    goals: simGoals,
    incomeEvents: simIncome,
    unexpectedEvents: simUnexpected,
  });

  const deltas = {
    remainingBalance: afterState.remainingBalance - beforeState.remainingBalance,
    safeDailyAllowance: afterState.safeDailyAllowance - beforeState.safeDailyAllowance,
    projectedDay30Balance: afterState.projectedDay30Balance - beforeState.projectedDay30Balance,
    healthScore: afterState.health.score - beforeState.health.score,
    riskScore: afterState.risk.score - beforeState.risk.score,
    runwayDays: Math.round((afterState.runwayDays - beforeState.runwayDays) * 10) / 10,
  };

  // Generate plain-language verdict with trade-offs
  const verdict = generateVerdict(beforeState, afterState, deltas, decisions);

  return {
    before: beforeState,
    after: afterState,
    deltas,
    verdict,
  };
}

/**
 * Editorial plain-language verdict generator with actionable trade-offs
 */
function generateVerdict(
  before: DayState,
  after: DayState,
  deltas: SimulationDiff["deltas"],
  decisions: SimulationDecision[]
): SimulationDiff["verdict"] {
  const isPositive = deltas.remainingBalance > 0 || (deltas.safeDailyAllowance >= 0 && deltas.riskScore <= 0);
  const isSevere = after.remainingBalance < 0 || after.risk.level === "Danger";

  let headline = "Safe Decision: Fits your current runway";
  let description = `This scenario leaves your Safe Daily Allowance at ${formatINR(after.safeDailyAllowance)}/day with steady buffer.`;
  let sentiment: "positive" | "warning" | "danger" | "neutral" = "neutral";

  if (after.remainingBalance < 0) {
    sentiment = "danger";
    headline = "Danger: Causes Overdraft!";
    description = `Committing these decisions puts you in overdraft by ${formatINR(Math.abs(after.remainingBalance))}. You would have ₹0 daily allowance.`;
  } else if (deltas.safeDailyAllowance < -100) {
    sentiment = "danger";
    headline = "Heavy Strain on Daily Allowance";
    description = `Your Safe Daily Allowance plummets from ${formatINR(before.safeDailyAllowance)} to ${formatINR(after.safeDailyAllowance)}/day (down ${formatINR(Math.abs(deltas.safeDailyAllowance))}).`;
  } else if (deltas.safeDailyAllowance < -30) {
    sentiment = "warning";
    headline = "Noticeable Ripple Effect";
    description = `Allowance trims by ${formatINR(Math.abs(deltas.safeDailyAllowance))}/day. Feasible, but reduces your discretionary headroom.`;
  } else if (isPositive) {
    sentiment = "positive";
    headline = "Healthy Move: Boosts Your Reserves";
    description = `Increases your daily allowance by +${formatINR(deltas.safeDailyAllowance)}/day and extends runway by +${deltas.runwayDays} days.`;
  }

  // Trade-offs list
  const tradeOffs: string[] = [];

  if (deltas.safeDailyAllowance < 0) {
    tradeOffs.push(
      `Daily spending room drops from ${formatINR(before.safeDailyAllowance)} to ${formatINR(after.safeDailyAllowance)}/day for the next ${after.daysRemaining} days.`
    );
  }

  if (after.runwayDays < before.runwayDays) {
    tradeOffs.push(
      `Runway contracts by ${(before.runwayDays - after.runwayDays).toFixed(1)} days (now ${after.runwayDays} days left).`
    );
  }

  // Check goal impacts
  for (const afterGoal of after.goalProjections) {
    const beforeGoal = before.goalProjections.find((g) => g.goalId === afterGoal.goalId);
    if (beforeGoal && beforeGoal.isOnTrack && !afterGoal.isOnTrack) {
      tradeOffs.push(
        `Puts "${afterGoal.goalName}" off track: you'd now need ${formatINR(afterGoal.dailySavingsNeeded)}/day instead of ${formatINR(beforeGoal.dailySavingsNeeded)}/day.`
      );
    }
  }

  if (after.risk.level === "Danger" && before.risk.level !== "Danger") {
    tradeOffs.push(
      `Flips financial risk seal from ${before.risk.level} to DANGER. Fixed bills risk default.`
    );
  }

  if (tradeOffs.length === 0) {
    tradeOffs.push("No critical trade-offs detected. Safe to commit.");
  }

  // Smart Alternatives
  const totalCost = decisions
    .filter((d) => d.amount > 0)
    .reduce((sum, d) => sum + d.amount, 0);

  const alternatives = [
    {
      title: "Delay purchase by 7 days",
      savings: Math.round(totalCost * 0.25),
      actionDescription: "Postponing until Day 20 keeps your allowance higher during the tight mid-month cycle.",
    },
    {
      title: "Split 50/50 with friends on UPI",
      savings: Math.round(totalCost * 0.5),
      actionDescription: `Splitting saves ${formatINR(Math.round(totalCost * 0.5))} immediately and cushions your runway.`,
    },
    {
      title: "Cancel 1 unused subscription",
      savings: 149,
      actionDescription: "Offset this expense by pausing an unused streaming or gaming subscription.",
    },
  ];

  return {
    headline,
    description,
    sentiment,
    tradeOffs,
    alternatives,
  };
}
