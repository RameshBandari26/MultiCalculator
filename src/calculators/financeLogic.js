import { Dec } from '../core/decimal.js';

/**
 * Monthly EMI on a reducing balance, payment at month end.
 * EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annualRate / 12 / 100. Zero rate => P / n.
 * @returns {import('decimal.js').Decimal} Unrounded EMI.
 */
export function monthlyEmi({ principal, annualRatePercent, months }) {
  const P = new Dec(principal);
  const r = new Dec(annualRatePercent).div(1200);
  if (r.isZero()) return P.div(months);
  const growth = r.plus(1).pow(months);
  return P.mul(r).mul(growth).div(growth.minus(1));
}

/**
 * Month-by-month schedule with per-instalment rounding to paise.
 * The EMI is rounded to 2 dp; interest each month is rounded to 2 dp; the last instalment
 * clears the exact remaining balance so the final outstanding balance is exactly zero.
 */
export function amortizationSchedule({ principal, annualRatePercent, months }) {
  const emi = monthlyEmi({ principal, annualRatePercent, months }).toDecimalPlaces(2);
  const monthlyRate = new Dec(annualRatePercent).div(1200);
  let balance = new Dec(principal);
  const rows = [];
  let totalInterest = new Dec(0);
  let totalPayment = new Dec(0);
  for (let month = 1; month <= months; month++) {
    const interest = balance.mul(monthlyRate).toDecimalPlaces(2);
    const principalPart = month === months ? balance : emi.minus(interest);
    const payment = principalPart.plus(interest);
    balance = balance.minus(principalPart);
    totalInterest = totalInterest.plus(interest);
    totalPayment = totalPayment.plus(payment);
    rows.push({ month, payment, interest, principalPart, balance });
  }
  return { emi, rows, totalInterest, totalPayment, finalBalance: balance };
}

/** SIP future value, investment at the start of each month: P·((1+i)^n − 1)/i·(1+i). */
export function sipFutureValue({ monthlyAmount, annualRatePercent, months }) {
  const P = new Dec(monthlyAmount);
  const i = new Dec(annualRatePercent).div(1200);
  if (i.isZero()) return P.mul(months);
  return P.mul(i.plus(1).pow(months).minus(1).div(i)).mul(i.plus(1));
}

/** Compound amount A = P(1 + r/k)^(k·t). */
export function compoundAmount({ principal, annualRatePercent, compoundingsPerYear, years }) {
  const ratePerPeriod = new Dec(annualRatePercent).div(new Dec(100).mul(compoundingsPerYear));
  return new Dec(principal).mul(ratePerPeriod.plus(1).pow(new Dec(compoundingsPerYear).mul(years)));
}

/** GST split. mode "excl": amount is the taxable value; "incl": amount includes GST. */
export function gstBreakdown({ amount, ratePercent, mode }) {
  const total = new Dec(amount);
  const rate = new Dec(ratePercent).div(100);
  const base = mode === 'excl' ? total : total.div(rate.plus(1));
  const tax = mode === 'excl' ? total.mul(rate) : total.minus(base);
  return { base, tax, total: base.plus(tax) };
}
