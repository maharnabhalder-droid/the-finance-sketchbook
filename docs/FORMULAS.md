# 📐 INKWELL Finance Engine Mathematical Formulas

This reference specifies all deterministic financial calculations executed in [/lib/engine/finance.ts](file:///e:/All%20Projects%20of%20Btech/Prompt%20run/lib/engine/finance.ts).

---

## 1. Remaining Cash Balance

Calculates actual disposable liquidity remaining in wallet and accounts:

$$\text{Balance} = \text{Start Budget} + \sum \text{Income} - \sum \text{Discretionary Spent} - \sum \text{Paid Commitments} - \sum \text{Saved to Goals}$$

- **Overdraft Guard**: If $\text{Balance} < 0$, the system enters an explicit `isOverdraft = true` state with `overdraftAmount = |\text{Balance}|`.
- **Zero-Crash Rule**: Negative balances never produce `NaN` or unhandled division exceptions.

---

## 2. Total Reserved Funds (Obligation Quarantine)

Funds quarantined to protect mandatory living expenses and wishlist commitments:

$$\text{Reserved} = \sum \text{Unpaid Commitments} + \sum \text{Active Subscriptions Due} + \text{Emergency Buffer}$$

Where:
- $\text{Emergency Buffer} = 0.10 \times \text{Start Budget (₹10,000)} = \text{₹1,000 default}$.
- Subscriptions due beyond Day 30 are excluded from the current cycle.

---

## 3. Dynamic Safe Daily Allowance

The central operational compass of INKWELL. Recomputed after every transaction, day-step, or simulation:

$$\text{Safe Daily Allowance} = \max\left(0, \frac{\text{Remaining Balance} - \text{Total Reserved}}{\max(1, 30 - \text{Current Day} + 1)}\right)$$

$$\Delta \text{Allowance} = \text{Safe Allowance}_{\text{today}} - \text{Safe Allowance}_{\text{yesterday}}$$

---

## 4. Recency-Weighted Burn Rate & Runway

A plain arithmetic average misses weekend binge spikes or end-of-month tightening. INKWELL applies recency weighting to daily spend:

$$\text{Weighted Daily Burn} = 0.50 \times \overline{\text{Spend}}_{\text{Last 3 Days}} + 0.30 \times \overline{\text{Spend}}_{\text{Days 4–7}} + 0.20 \times \overline{\text{Spend}}_{\text{Older Days}}$$

$$\text{Runway (Days)} = \frac{\max(0, \text{Remaining Balance})}{\max(1, \text{Weighted Daily Burn})}$$

---

## 5. 30-Day Multi-Cone Trajectory

For each day $t \in [\text{Current Day}, 30]$ with $\Delta t = t - \text{Current Day}$:

1. **Expected Path**:
   $$\text{Balance}_{\text{expected}}(t) = \max\left(0, \text{Balance} - \text{Weighted Burn} \times \Delta t - \sum \text{Dues}(t)\right)$$

2. **Best-Case Path (30% Tighter Discipline)**:
   $$\text{Balance}_{\text{best}}(t) = \max\left(0, \text{Balance} - (0.70 \times \text{Weighted Burn}) \times \Delta t - \sum \text{Dues}(t)\right)$$

3. **Worst-Case Path (45% Looser Variance / Spikes)**:
   $$\text{Balance}_{\text{worst}}(t) = \max\left(0, \text{Balance} - (1.45 \times \text{Weighted Burn}) \times \Delta t - \sum \text{Dues}(t)\right)$$

---

## 6. Financial Risk Score (0–100) & Wax Seal Classification

Calculated from 5 penalty factors:

| Risk Factor | Formula | Max Penalty |
| :--- | :--- | :---: |
| **Runway Shortfall** | If $\text{Runway} < \text{Days Left}$, $\min(30, 30 \times (1 - \text{Runway}/\text{Days Left}))$ | 30 pts |
| **Spend Volatility** | $\min(20, \text{Coefficient of Daily Variance} \times 20)$ | 20 pts |
| **Commitment Coverage** | $\min(20, 20 \times (1 - \min(1, \text{Balance}/\text{Reserved})))$ | 20 pts |
| **Subscription Load** | If $\text{Monthly Subs} > 15\% \text{ of Budget}$, $\min(15, (\text{Subs Ratio} - 0.15) \times 100)$ | 15 pts |
| **Buffer Depletion** | If $\text{Balance} < \text{Emergency Buffer}$, $\min(15, 15 \times (1 - \text{Balance}/\text{Buffer}))$ | 15 pts |

### Seal Mapping:
- **`Safe` (Emerald Seal)**: Score $0 - 35$
- **`Watch` (Saffron Seal)**: Score $36 - 69$
- **`Danger` (Vermilion Seal)**: Score $70 - 100$ (or any negative balance / overdraft)

---

## 7. Financial Health Composite Index (0–100)

Weighted evaluation across 5 diagnostic pillars:

$$\text{Health Score} = 0.25(\text{Adherence}) + 0.25(\text{Savings Pace}) + 0.20(\text{Risk Cushion}) + 0.15(\text{Subscription Hygiene}) + 0.15(\text{Spending Consistency})$$

### Academic Grade Conversion:
- **Grade A+**: $90 - 100$
- **Grade A**: $80 - 89$
- **Grade B**: $70 - 79$
- **Grade C**: $55 - 69$
- **Grade D**: $40 - 54$
- **Grade F**: $< 40$ (or Overdraft)
