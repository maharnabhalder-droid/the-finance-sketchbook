import { z } from "zod";

/**
 * Zod Schemas for Runtime Data Boundary Validation
 * Guarantees zero NaN, zero negative crashes, and enforces strict Gen Z input validation.
 */

export const TransactionCategorySchema = z.enum([
  "Food & Dining",
  "Transport & Commute",
  "Entertainment & Gaming",
  "Shopping & Personal",
  "Bills & Utilities",
  "Academics & Books",
  "Health & Emergency",
  "Other",
]);

export const TransactionInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(60, "Title is too long"),
  amount: z.number().positive("Amount must be greater than zero").finite("Amount must be a valid number"),
  day: z.number().int().min(1).max(30),
  category: TransactionCategorySchema,
  note: z.string().max(200).optional(),
  isEssential: z.boolean().optional(),
});

export const SavingsGoalInputSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(50),
  target: z.number().positive("Target amount must be positive").finite(),
  deadlineDay: z.number().int().min(1).max(30),
  priority: z.enum(["high", "medium", "low"]),
  emoji: z.string().optional(),
  notes: z.string().max(200).optional(),
});

export const SubscriptionInputSchema = z.object({
  name: z.string().min(1, "Subscription name is required").max(50),
  price: z.number().positive("Price must be positive").finite(),
  cycle: z.enum(["monthly", "yearly"]),
  dueDay: z.number().int().min(1).max(30),
  active: z.boolean(),
  category: z.enum(["Streaming", "Music", "Productivity", "Gaming", "Cloud & Storage"]),
});

export const CommitmentInputSchema = z.object({
  name: z.string().min(1, "Commitment name is required").max(60),
  amount: z.number().positive("Amount must be positive").finite(),
  dueDay: z.number().int().min(1).max(30),
  isPaid: z.boolean(),
  category: z.enum([
    "Mobile & Internet",
    "Transit Pass",
    "Tuition / Course",
    "Rent / Room Share",
    "Other Fixed Due",
  ]),
});

export const SimulationDecisionSchema = z.object({
  type: z.enum([
    "one_off_purchase",
    "new_subscription",
    "cancel_subscription",
    "habit_change",
    "goal_transfer",
    "side_income",
    "unexpected_expense",
  ]),
  title: z.string().min(1),
  amount: z.number().finite(),
  targetId: z.string().optional(),
  frequencyPerWeek: z.number().optional(),
  delayDays: z.number().optional(),
});

// Helper validation functions
export function validateTransaction(data: unknown) {
  return TransactionInputSchema.safeParse(data);
}

export function validateSavingsGoal(data: unknown) {
  return SavingsGoalInputSchema.safeParse(data);
}

export function validateSubscription(data: unknown) {
  return SubscriptionInputSchema.safeParse(data);
}

export function validateSimulationDecision(data: unknown) {
  return SimulationDecisionSchema.safeParse(data);
}
