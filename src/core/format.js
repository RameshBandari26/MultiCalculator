import { Dec } from './decimal.js';

/** Indian-grouped number with fixed decimals, e.g. 1234567.5 -> "12,34,567.50". */
export const fmt = (value, decimals = 2) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);

/**
 * Format money as INR. Rounds half-up to paise using decimal arithmetic (display only).
 * @param {number|import('decimal.js').Decimal} value
 */
export const inr = (value) => `₹${fmt(new Dec(value).toDecimalPlaces(2, Dec.ROUND_HALF_UP).toNumber())}`;

/** Format to 10 significant digits (removes floating-point noise) with Indian grouping. */
export const sig = (value) =>
  Number(Number(value).toPrecision(10)).toLocaleString('en-IN', { maximumFractionDigits: 8 });
