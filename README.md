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

