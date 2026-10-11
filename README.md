# 📓 INKWELL — The Personal Finance Sketchbook for Gen Z

> **"Simulate every rupee before you commit it."**  
> A tactile, editorial financial ledger where Indian Gen Z manages a limited **₹10,000 budget over 30 days**. Built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and pure unit-tested mathematical models.

🌐 **Live Deployed App**: [https://the-finance-sketchbook.vercel.app/](https://the-finance-sketchbook.vercel.app/)

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run pure engine unit tests
npx vitest run

# 3. Launch local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏛 Architecture Diagram

```
                                      ┌──────────────────────────────────────────────┐
                                      │              INKWELL DASHBOARD               │
                                      │         (Next.js App Router Client)          │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                   ┌─────────────────────────┴─────────────────────────┐
                                   ▼                                                   ▼
                    ┌──────────────────────────────┐                   ┌───────────────────────────────┐
                    │       LEFT PAGE: "TODAY"     │                   │      RIGHT PAGE: CHAPTERS     │
                    │  • Safe Daily Allowance HUD  │                   │  01. Daily Cashflow Ledger    │
                    │  • Remaining Cash & Overdraft│                   │  02. Spending & Habit Sliders │
                    │  • Runway & Burn Rate (days) │                   │  03. Fixed Dues & Subscriptions
                    │  • Wax Seal Stamp (Risk)     │                   │  04. Taped Goals & Wishlists  │
                    │  • Health Grade (A+ to F)    │                   │  05. DECISION SIMULATOR (Hero)│
                    │  • Reactive Marginalia Notes │                   │  06. 3-Cone Forecast & Shocks │
                    └──────────────┬───────────────┘                   │  07. Health Insights & Badges │
                                   │                                   │  08. Month-End Report Card    │
                                   │                                   └───────────────┬───────────────┘
                                   │                                                   │
                                   └─────────────────────────┬─────────────────────────┘
                                                             ▼
                                              ┌──────────────────────────────┐
                                              │      ZUSTAND GLOBAL STORE    │
                                              │  (LocalStorage Persistence)  │
                                              └──────────────┬───────────────┘
                                                             │
                                                             ▼
                                      ┌──────────────────────────────────────────────┐
                                      │         PURE FINANCE ENGINE (/lib/engine)    │
                                      │  • computeDayState()                         │
                                      │  • simulateScenario()                        │
                                      │  • computeForecastCones()                    │
                                      │  • computeRiskScore()                        │
                                      │  • computeHealthScore()                      │
                                      │  • formatINR() via Intl.NumberFormat('en-IN')│
                                      └──────────────────────────────────────────────┘
```

---

## 📐 The Connected Finance Formulas

Every number in INKWELL is derived from pure, deterministic mathematical functions in `lib/engine/finance.ts`:

### 1. Remaining Balance
$$\text{Balance} = \text{Start Budget (₹10,000)} + \text{Income} - \text{Total Spent} - \text{Committed Paid} - \text{Moved To Goals}$$
*Handles overspending gracefully via an explicit `isOverdraft` danger state.*

### 2. Total Reserved Capital
$$\text{Reserved} = \text{Unpaid Commitments} + \text{Subscriptions Due Before Day 30} + \text{Goal Allocations} + \text{Emergency Buffer (₹1,000 default)}$$
*Quarantines non-negotiable cash so users never accidentally spend their phone recharge or rent money on Swiggy.*

### 3. Dynamic Safe Daily Allowance
$$\text{Safe Daily Allowance} = \frac{\text{Remaining Balance} - \text{Total Reserved}}{\text{Days Remaining (30} - \text{Current Day)}}$$
*Recalculated in real-time after every single coffee, UPI split, or hypothetical scenario. Shown with a live delta vs yesterday.*

### 4. Recency-Weighted Burn Rate & Runway
$$\text{Weighted Daily Burn} = 0.5 \times \text{Avg}(\text{Last 3 Days}) + 0.3 \times \text{Avg}(\text{Days 4–7}) + 0.2 \times \text{Avg}(\text{Older Days})$$
$$\text{Runway Days} = \frac{\text{Remaining Balance}}{\max(\text{Weighted Daily Burn}, 1)}$$

### 5. 30-Day Multi-Cone Trajectory
For each day $t \in [t_{\text{now}}, 30]$:
- **Best Case**: Burn Rate tightened by $30\%$ ($\times 0.7$)
- **Expected Case**: Weighted burn rate maintained ($\times 1.0$)
- **Worst Case**: Unplanned spikes and looser spending ($\times 1.45$)

### 6. Risk Score & Wax Seal (0–100)
Composed of 6 weighted penalty factors:
- Runway shortfall vs remaining days (max 30 pts)
- Spending volatility & variance (max 20 pts)
- Commitment coverage ratio (max 20 pts)
- Subscription load $>15\%$ of budget (max 15 pts)
- Emergency buffer depletion (max 15 pts)
- **Status Mapping**:
  - `Safe` (Score $0 - 35$): Emerald wax seal
  - `Watch` (Score $36 - 69$): Amber marigold wax seal
  - `Danger` (Score $70 - 100$): Crimson vermilion wax seal

### 7. Financial Health Composite (0–100)
$$\text{Health} = 0.25(\text{Adherence}) + 0.25(\text{Savings Pace}) + 0.20(\text{Risk Control}) + 0.15(\text{Sub Hygiene}) + 0.15(\text{Consistency})$$

---

## 🌊 How Decisions Ripple Through INKWELL

When you propose a decision in the **Decision Simulator** (e.g. buying a ₹1,200 hoodie on Myntra or cancelling Netflix):

1. **Simulation Sandbox**: A hypothetical fork of the entire state is created in memory without modifying your real records.
2. **Deterministic Diffing**: `simulateScenario()` re-runs all formulas on the hypothetical state and compares it against your current state.
3. **Ripple Propagation**:
   - **Safe Daily Allowance**: Drops from ₹218/day to ₹164/day (-₹54/day).
   - **Goal Deadlines**: Goa Trip deadline is pushed out by 4 days due to reduced daily surplus.
   - **Risk Seal**: Shifts from `Safe` to `Watch` due to tightened runway buffer.
   - **Health Score**: Recalculated with clear explanation: *"This purchase drops your allowance below your ₹180 baseline."*
4. **Editorial Verdict & Smart Alternatives**: The engine auto-generates 3 alternatives:
   - *Alternative A*: Wait 6 days until after Day 18 phone recharge.
   - *Alternative B*: Split 50% with friend or find student discount.
   - *Alternative C*: Divert ₹400 from lowest-priority savings goal.
5. **1-Click Commit with Instant Undo**: If you commit, the changes apply across the ledger with an immediate undo toast.

---

## 🎨 Design System: "The Finance Sketchbook"

- **Canvas & Paper Grain**: Warm cream parchment background (`#faf6ee`) with subtle paper texture, deckled edges, and washi-tape tabs.
- **Midnight Ink Mode**: Deep navy folio (`#0a0f1d`) with cream calligraphy and glowing warm brass accents.
- **Typography**:
  - Headings & Big Numerals: **Fraunces** / **Playfair Display** (refined serif display).
  - Clean UI & Controls: **Inter** / **Geist** (high-legibility sans-serif).
  - Annotations & Marginalia: **Caveat** (authentic student handwriting notes in margins).
- **The Lens**: A brass magnifying loupe cursor follower (hover over any metric to see its mathematical derivation; toggleable via navbar).
- **Physical Wax Seal**: Custom 3D SVG wax seal stamp that dynamically animates and thumps onto the page when risk status transitions.

---

## 🧪 Unit Tests

Pure unit tests cover all financial engine modules:
- Safe daily allowance recalculation
- Multi-cone forecast balance projections
- Multi-factor risk calculation and seal classification
- 5-pillar health score computation
- Decision simulator before/after diffing
- Indian Rupee format compliance (`₹10,000`, `₹1,00,000`)
- Overdraft protection and negative-balance handling

Run anytime via:
```bash
npx vitest run
```
