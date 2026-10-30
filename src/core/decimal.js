import Decimal from 'decimal.js';

/** Decimal constructor used for all money maths: 50 significant digits, half-up rounding. */
export const Dec = Decimal.clone({ precision: 50, rounding: Decimal.ROUND_HALF_UP });
