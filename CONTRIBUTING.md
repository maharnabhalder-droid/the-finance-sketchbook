# Contributing to INKWELL 📓

Thank you for your interest in contributing to **INKWELL — The Personal Finance Sketchbook for Gen Z**!

---

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/maharnabhalder-droid/the-finance-sketchbook.git
   cd the-finance-sketchbook
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run unit tests**:
   ```bash
   npx vitest run
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

---

## 📐 Golden Architectural Guidelines

1. **Pure Finance Core**: All financial calculations must live strictly within `/lib/engine`. Do not write inline arithmetic or financial derivations in React components.
2. **Deterministic Tests**: Every new calculation must be accompanied by unit tests in `/lib/engine/__tests__`.
3. **Strict TypeScript**: Do not use `any`. Always declare precise types in `/lib/engine/types.ts` or schemas in `/lib/engine/schemas.ts`.
4. **Accessibility First**:
   - Ensure all interactive elements have visible `:focus-visible` styles.
   - Maintain minimum 36px–44px touch targets.
   - Provide textual and tabular alternatives for SVGs and charts.

---

## 🚀 Branching & Commit Conventions

- Use conventional commits:
  - `feat(...)`: New interactive features
  - `fix(...)`: Bug or calculation fixes
  - `perf(...)`: Bundle and runtime optimizations
  - `a11y(...)`: Accessibility improvements
  - `docs(...)`: Documentation and ADR updates
  - `test(...)`: Unit and integration test coverage
