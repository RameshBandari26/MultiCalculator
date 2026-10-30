# Migrated calculators and verification status

All are **`testing`**: implemented with automated tests, but the formulas and assumptions have **not** been checked against cited sources, so none is marked `verified` and `sources` is empty. Effective dates only matter for rule-dependent calculators; none here embeds a tax rule (GST rate is user-entered).

| id | Formula | Independent test evidence | Open items before `verified` |
|---|---|---|---|
| percent-of | X/100 × Y | hand values, zero, negative, 1e15 | none beyond source note |
| percent-change | Y × (1 ± X/100) | hand values, inverse-not-equal check, 0% and 100% boundaries | — |
| emi | P·r·(1+r)ⁿ/((1+r)ⁿ−1) | Python-decimal references for 3 loans; amortisation schedule reconciles, final balance 0 | cite lender/standard reference; document month-rounding of tenure |
| gst | base = total/(1+r); tax = total − base | hand values; excl/incl round trip | confirm CGST/SGST split text against GST law before publishing |
| sip | P·((1+i)ⁿ−1)/i·(1+i) | Python simulation reference; in-test simulation | cite convention (start-of-month investment) |
| compound | P(1+r/k)^(kt) | repeated-multiplication reference; fractional years | — |
| convert | factor table via base unit | published definitions, round trips for all pairs, temperature boundaries | cite each factor (NIST/BIPM); regional land units intentionally absent |
| date-diff | UTC calendar days | leap/non-leap, century rules, swapped dates | time-zone behaviour is UTC-only |
| age | calendar y/m/d with month borrowing | hand-derived cases incl. leap day | decide convention for 29 Feb birthdays |
| scientific | recursive-descent parser, doubles | precedence, domain errors, hostile input | document double-precision limits |
| pricing-flow | unit → markup → GST → profit (workflow engine) | hand calculation, upstream-change and failure-propagation tests | assumption that GST is pass-through |

## EMI schedule rounding (tested in `finance.test.js`)
Schedule rounds the EMI and each month's interest to paise; the last instalment clears the exact balance. For ₹8,00,000 at 9% over 60 months the rounded EMI is ₹16,606.68, the final balance is exactly 0, and total interest differs from the unrounded model by under ₹1.
