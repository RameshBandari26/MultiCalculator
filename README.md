# Master Calculator

Every calculation. One smart place. A React + JavaScript (no TypeScript) port of the single-file Master Calculator MVP, with the same calculators, search, workflow, history, favourites, theme and URLs.

## Requirements
Node 20+ and npm.

## Commands
```bash
npm install            # install dependencies
npm run dev            # dev server (http://localhost:5173)
npm run build          # production build to dist/
npm run preview        # serve the build on :4173
npm test               # Vitest unit + integration tests
npm run test:e2e       # Playwright (run `npx playwright install chromium` once first)
```

## Structure
```
src/
  core/          decimal config, validation, formatting, expression parser, units, dates, runtime self-tests
  calculators/   one file per group + financeLogic.js (pure Decimal maths) + registry (index.js)
  search/        intent.js (extract supported intents), rank.js (fuzzy ranking), index.js
  workflows/     engine.js (topological order, cycle detection, error propagation), pricingWorkflow.js
  storage/       safeStorage, history, favourites, theme (localStorage, keys mc.hist / mc.fav / mc.theme)
  components/    Layout, SearchBar, Home, CalculatorPage, ResultPanel, ...
  tests/         Vitest suites
e2e/             Playwright specs
docs/            feature checklist, calculator status and formulas
```

## URLs
Hash routing: `/#/emi`, `/#/gst`, ... Old single-file links like `/#emi` are redirected automatically.

## Adding a calculator
Create a definition with `defineCalculator({ id, name, cat, desc, alias, fields, run })`, add it to `src/calculators/index.js`, put pure maths in a separate function, and add tests with independently derived reference values. New calculators start as status `testing`.

## Status and test results (actual runs)
- `npm test`: 9 files, **78 passed, 0 failed**.
- `npm run build`: succeeds (about 78 kB gzip JS).
- `npm run test:e2e`: 6 specs written, **0 executed**. The browser download was blocked in the build environment, so none could launch. Run them locally.
- No linter is configured.

## Known limitations
- No formula is marked `verified`. Sources have not been checked, and `docs/calculators.md` says so per calculator.
- Money calculators use decimal.js; the scientific calculator uses IEEE doubles.
- The EMI amortisation schedule is implemented and tested but not shown in the UI.
- Not built: education, health, construction, engineering, programming, agriculture, vehicles, income tax, regional languages, offline/PWA, user-defined workflows.

## Recommended next steps
1. Run the Playwright specs locally and fix any failures.
2. Check each formula against official or standard references, record source and date in `verification`, and only then change status.
3. Show the amortisation schedule and a prepayment comparison.
4. Add ESLint and CI (test + build on every push).
5. Add the next calculators (CGPA with explicit rule selection, BMI, tax regimes with effective dates).
