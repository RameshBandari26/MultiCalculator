# Feature checklist (behaviour of the single-file MVP, and where it lives now)

| Feature | Original behaviour | Now | Covered by |
|---|---|---|---|
| 11 calculators, same ids | percent-of, percent-change, emi, gst, sip, compound, convert, date-diff, age, scientific, pricing-flow | `src/calculators/` | calculators.test.js |
| Inputs validated, errors shown, no silent zeros | yes | same messages | per-calculator tests |
| Formula, steps, assumptions | shown per result | `ResultPanel` | app.test.jsx |
| Intent search | "X percent of Y", "increase/decrease Y by X percent", EMI with lakh/crore, "convert N unit to unit", expressions | `src/search/intent.js` | intent.test.js |
| Ranked fuzzy search | words, typos (edit distance 1), prefixes | `src/search/rank.js` (+ stop words) | intent.test.js |
| Safe expression parser | no eval, 200 chars, depth 50 | `src/core/parser.js` | parser.test.js |
| Workflow | cost → price → profit chain | `src/workflows/` (generic engine + pricing flow) | workflow.test.js |
| History | last 20, saved on Calculate and on search-opened calculators, clear button | `src/storage/history.js` | storage + app tests |
| Favourites | toggle, shown on home | `src/storage/favourites.js` | storage + app tests |
| Theme | light/dark, persisted, follows OS by default | `ThemeToggle` | app.test.jsx |
| URLs | `#id` | `#/id` (old `#id` redirects) | e2e spec (not run) |
| Footer self-test | 14 runtime checks | `src/core/selfTest.js` | selfTest.test.js |
| Copy result | yes | yes | — |

## Deliberate differences (not silent)
1. **Search stop words.** The original matched the word "a" in descriptions, so "tell me a joke" returned GST. Fixed; test added.
2. **Decimal arithmetic.** EMI, GST, SIP, compound and the pricing workflow now use decimal.js (50 digits). Money is rounded half-up to paise at display time. The original used `Math.round` on doubles, which shows 1.005 as ₹1.00; now ₹1.01. Results otherwise agree with the original to within floating-point noise.
3. **SIP minimum period.** A tenure that rounds to 0 months now gives an error instead of ₹0.
4. **Accessibility/UX additions.** Skip link, labelled combobox with arrow-key navigation, `/` focuses search, focus moves to the result or error after Calculate, page titles, not-found state, empty states, favourite cards are real links.
