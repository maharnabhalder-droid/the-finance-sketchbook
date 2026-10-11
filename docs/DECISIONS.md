# 📋 Architectural Decision Records (ADR)

This log records the foundational architectural decisions made for **INKWELL**, detailing the context, options considered, decisions, and consequences.

---

## ADR-001: Pure, Framework-Agnostic Finance Engine

### Status: Accepted
### Context
Financial calculation logic must remain deterministically unit-tested, predictable, and isolated from React re-renders or Next.js lifecycle changes.

### Decision
Implement all domain formulas (balance, safe allowance, runway, forecast cones, risk scores, health composite) inside `/lib/engine/finance.ts` as pure, side-effect-free TypeScript functions. The engine accepts an `EngineInput` object and returns a `DayState` or `SimulationDiff`.

### Consequences
- **Positive**: 100% test coverage using standard Vitest unit tests without needing React component rendering overhead.
- **Positive**: Zero coupling to UI libraries; engine functions run identically on client, server route handlers, or CLI scripts.
- **Negative**: UI components must pass state to selector functions rather than embedding ad-hoc mathematical derivations.

---

## ADR-002: Dual-Page 3D Ledger with Next/Dynamic Code Splitting

### Status: Accepted
### Context
The user experience requires an editorial physical sketchbook aesthetic ("Left Page Today HUD, Right Page Active Chapter"). Statically importing all 8 module chapters would force users to download Recharts (4.4MB) and all secondary views on initial landing page load.

### Decision
Keep Chapter 01 (`OverviewPage`) eagerly imported for instant LCP on initial paint. Dynamically split all subsequent chapters (`SpendingPage`, `CommitmentsPage`, `GoalsPage`, `SimulatorPage`, `ForecastRiskPage`, `HealthInsightsPage`, `MonthEndReportCard`) using Next.js `dynamic()` with zero-layout-shift `PageSkeleton` fallbacks.

### Consequences
- **Positive**: Initial bundle dropped from 176 kB down to 64 kB (-63.6%). First Load JS reduced from 264 kB to 152 kB (-42.4%).
- **Positive**: Zero visual layout shift (CLS < 0.05).
- **Negative**: Brief skeleton render on the very first time a user flips to a heavy chapter before chunk caching.

---

## ADR-003: Versioned LocalStorage Persistence with Zero Paid APIs

### Status: Accepted
### Context
Gen Z users demand absolute privacy for their finances, fast load times, and no login/signup friction. The application must run without paid databases, subscriptions, or external API keys while maintaining persistence across sessions.

### Decision
Use Zustand's `persist` middleware backed by device `localStorage` with explicit schema versioning (`STORE_VERSION: 1`) and a migration fallback to seed demo data in case of corrupted schemas. Provide manual JSON Export/Import in the Settings modal for device portability.

### Consequences
- **Positive**: Zero running cost; deployable to Vercel free tier with 100% data privacy.
- **Positive**: Zero cold-start latency; state is hydrated immediately from local device storage.
- **Negative**: Data is tied to the specific browser instance unless explicitly exported via JSON backup.

---

## ADR-004: The Brass Lens Formula Inspection via requestAnimationFrame

### Status: Accepted
### Context
Fintech apps frequently display opaque scores that users do not trust. INKWELL introduces "The Lens", a brass cursor loupe that reveals exact underlying mathematical formulas when hovering metrics. Initial unthrottled `mousemove` listeners risked layout thrashing and dropped frames.

### Decision
Batch all cursor coordinates and DOM inspection calls inside browser `requestAnimationFrame` cycles, canceling unrendered frames on mouse acceleration.

### Consequences
- **Positive**: Locks consistent 60fps rendering without dropped animation frames.
- **Positive**: Immediate transparency: users can inspect every formula (e.g. `(Balance - Reserved) ÷ Days Left`).
- **Negative**: Requires graceful fallback and disabling when `prefers-reduced-motion` is active.
