# 📜 Changelog

All notable changes to **INKWELL** are documented in this file.

---

## [1.2.0] - 2026-10-11 - Quality Pass Architecture & Reliability
### Added
- Standard Next.js route boundaries: `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`.
- Centralized constants and configuration layer: `lib/config/constants.ts` (`FINANCE_CONFIG`).
- Runtime Zod validation schemas for all data boundaries: `lib/engine/schemas.ts`.
- LocalStorage persistence versioning (`STORE_VERSION: 1`) with safe migration fallback.
- Architectural documentation: `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/FORMULAS.md`.
- Automated test suite expansion to 24 tests covering schemas, WCAG contrast, and route smoke tests.

---

## [1.1.0] - 2026-10-11 - Performance & Accessibility Surgical Pass
### Added
- Production `next.config.js` with HTTP security headers (HSTS, CSP, nosniff) and immutable asset caching.
- Automated search indexing artifacts: `app/robots.ts` and `app/sitemap.ts`.
- Skip-to-content navigation link for screen readers and keyboard navigation.
- Accessible dialog semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Esc keyboard handlers).
- Screen-reader accessible data table fallback for Recharts multi-cone area chart.
- Global high-contrast `:focus-visible` outline styles and prefers-reduced-motion overrides.
- `requestAnimationFrame` cursor physics batching in `TheLens.tsx` locking 60fps.

### Changed
- Converted non-initial chapter pages to lazy imports using `next/dynamic` with skeleton loaders.
- Reduced Route `/` bundle from 176 kB down to 64 kB (-63.6%).
- Reduced First Load JS from 264 kB down to 152 kB (-42.4%).

---

## [1.0.0] - 2026-10-11 - Initial Production Release
### Added
- Complete 30-day personal finance sketchbook for Gen Z managing ₹10,000 budget.
- 8 interactive book chapters: Overview, Spending, Commitments, Goals, Simulator, Forecast, Health, and Report Card.
- Decision Simulator sandbox with side-by-side before/after comparison and 3 smart alternatives.
- The Brass Lens cursor-follower formula inspector.
- Physical 3D SVG Wax Seal risk stamp (`Safe`, `Watch`, `Danger`).
- Dual themes: Parchment and Midnight Ink.
- 100% on-device local storage persistence with JSON export/import.
- Pure deterministic engine with Indian Rupee formatting (`en-IN`).
