import { describe, it, expect } from 'vitest';
import { Dec } from '../core/decimal.js';
import { amortizationSchedule, compoundAmount, gstBreakdown, monthlyEmi, sipFutureValue } from '../calculators/financeLogic.js';
import { CALCULATOR_BY_ID } from '../calculators/index.js';
import { inr } from '../core/format.js';

/*
 * Reference values were computed independently in Python's decimal module (60 digits),
 * not with this code: EMI closed form, SIP by month-by-month simulation (matches the closed form),
 * compound interest by repeated multiplication.
 */
describe('EMI', () => {
  it('matches independent references', () => {
    expect(monthlyEmi({ principal: 800000, annualRatePercent: 9, months: 60 }).toNumber()).toBeCloseTo(16606.684181, 5);
    expect(monthlyEmi({ principal: 2500000, annualRatePercent: 8.5, months: 240 }).toNumber()).toBeCloseTo(21695.580834, 5);
  });
  it('total interest matches reference', () => {
    const emi = monthlyEmi({ principal: 800000, annualRatePercent: 9, months: 60 });
    expect(emi.mul(60).minus(800000).toNumber()).toBeCloseTo(196401.050865, 4);
    const big = monthlyEmi({ principal: 2500000, annualRatePercent: 8.5, months: 240 });
    expect(big.mul(240).minus(2500000).toNumber()).toBeCloseTo(2706939.400193, 3);
  });
  it('zero interest divides the principal evenly', () => {
    expect(monthlyEmi({ principal: 500000, annualRatePercent: 0, months: 24 }).toNumber()).toBeCloseTo(20833.333333, 6);
  });
  it('calculator displays rounded paise and accepts Indian-grouped input', () => {
    const result = CALCULATOR_BY_ID.emi.run({ p: '8,00,000', r: 9, y: 5 });
    expect(result.main).toBe('₹16,606.68');
    expect(result.rows[1][1]).toBe('₹9,96,401.05');
    expect(result.rows[2][1]).toBe('₹1,96,401.05');
  });
  it('validates inputs and boundaries', () => {
    const run = (v) => () => CALCULATOR_BY_ID.emi.run({ p: 800000, r: 9, y: 5, ...v });
    expect(run({ p: 0 })).toThrow('greater than 0');
    expect(run({ p: -1 })).toThrow();
    expect(run({ p: '' })).toThrow('required');
    expect(run({ p: 'abc' })).toThrow('valid number');
    expect(run({ r: -1 })).toThrow('at least 0');
    expect(run({ r: 100.5 })).toThrow('at most 100');
    expect(run({ y: 0 })).toThrow();
    expect(run({ y: 50.5 })).toThrow('at most 50');
    expect(run({ y: 0.01 })).toThrow('at least 1 month');
    expect(run({ p: Infinity })).toThrow();
    expect(run({ r: 100 })()).toBeTruthy();
    expect(run({ y: 50 })()).toBeTruthy();
  });
});

describe('EMI amortization schedule', () => {
  const args = { principal: 800000, annualRatePercent: 9, months: 60 };
  const schedule = amortizationSchedule(args);
  it('ends with exactly zero outstanding balance', () => {
    expect(schedule.rows).toHaveLength(60);
    expect(schedule.finalBalance.isZero()).toBe(true);
    expect(schedule.rows.every((row) => row.balance.gte(0))).toBe(true);
  });
  it('principal repaid equals the loan and payments reconcile to principal + interest', () => {
    const principalPaid = schedule.rows.reduce((sum, row) => sum.plus(row.principalPart), new Dec(0));
    expect(principalPaid.toString()).toBe('800000');
    expect(schedule.totalPayment.minus(schedule.totalInterest).toString()).toBe('800000');
  });
  it('rounding differences against the unrounded model stay within rupees', () => {
    const unroundedInterest = monthlyEmi(args).mul(60).minus(800000);
    const interestDifference = schedule.totalInterest.minus(unroundedInterest).abs().toNumber();
    expect(interestDifference).toBeLessThan(1);
    const lastPaymentGap = schedule.rows[59].payment.minus(schedule.emi).abs().toNumber();
    expect(lastPaymentGap).toBeLessThan(1);
    expect(schedule.emi.toString()).toBe('16606.68');
  });
  it('first month interest = balance × monthly rate', () => {
    expect(schedule.rows[0].interest.toString()).toBe('6000');
  });
  it('zero-rate schedule has no interest and still clears the balance', () => {
    const s = amortizationSchedule({ principal: 500000, annualRatePercent: 0, months: 24 });
    expect(s.totalInterest.isZero()).toBe(true);
    expect(s.finalBalance.isZero()).toBe(true);
    expect(s.totalPayment.toString()).toBe('500000');
  });
});

describe('SIP', () => {
  it('matches the month-by-month simulation reference', () => {
    expect(sipFutureValue({ monthlyAmount: 5000, annualRatePercent: 12, months: 120 }).toNumber()).toBeCloseTo(1161695.38176, 4);
  });
  it('agrees with an independent in-test simulation', () => {
    let balance = new Dec(0);
    for (let m = 0; m < 120; m++) balance = balance.plus(5000).mul(new Dec(1).plus(new Dec(12).div(1200)));
    expect(sipFutureValue({ monthlyAmount: 5000, annualRatePercent: 12, months: 120 }).minus(balance).abs().toNumber()).toBeLessThan(1e-6);
  });
  it('zero return equals total invested; validates inputs', () => {
    expect(CALCULATOR_BY_ID.sip.run({ p: 5000, r: 0, y: 10 }).raw).toBe(600000);
    const run = (v) => () => CALCULATOR_BY_ID.sip.run({ p: 5000, r: 12, y: 10, ...v });
    expect(run({ p: 0 })).toThrow();
    expect(run({ r: -1 })).toThrow();
    expect(run({ y: 61 })).toThrow();
    expect(run({ y: 0.01 })).toThrow('at least 1 month');
    expect(CALCULATOR_BY_ID.sip.run({ p: 5000, r: 12, y: 10 }).main).toBe('₹11,61,695.38');
  });
});

describe('Compound interest', () => {
  it('matches repeated-multiplication reference', () => {
    expect(compoundAmount({ principal: 100000, annualRatePercent: 7, compoundingsPerYear: 4, years: 5 }).toNumber()).toBeCloseTo(141477.819576, 5);
  });
  it('handles zero years, zero rate, fractional years and bad compounding', () => {
    expect(CALCULATOR_BY_ID.compound.run({ p: 1000, r: 7, t: 0, k: 4 }).raw).toBe(1000);
    expect(CALCULATOR_BY_ID.compound.run({ p: 1000, r: 0, t: 5, k: 4 }).raw).toBe(1000);
    expect(CALCULATOR_BY_ID.compound.run({ p: 100000, r: 7, t: 2.5, k: 4 }).raw).toBeCloseTo(100000 * Math.pow(1.0175, 10), 6);
    expect(() => CALCULATOR_BY_ID.compound.run({ p: 1000, r: 7, t: 5, k: 0 })).toThrow();
    expect(() => CALCULATOR_BY_ID.compound.run({ p: 1000, r: 7, t: 5, k: 366 })).toThrow('at most 365');
    expect(() => CALCULATOR_BY_ID.compound.run({ p: -1, r: 7, t: 5, k: 4 })).toThrow();
  });
});

describe('GST and money rounding', () => {
  it('splits exclusive and inclusive amounts consistently', () => {
    const exclusive = gstBreakdown({ amount: 1000, ratePercent: 18, mode: 'excl' });
    expect(exclusive.tax.toString()).toBe('180');
    expect(exclusive.total.toString()).toBe('1180');
    const inclusive = gstBreakdown({ amount: 1180, ratePercent: 18, mode: 'incl' });
    expect(inclusive.base.toNumber()).toBeCloseTo(1000, 12);
    expect(inclusive.tax.toNumber()).toBeCloseTo(180, 12);
  });
  it('handles zero rate and zero amount; validates', () => {
    expect(CALCULATOR_BY_ID.gst.run({ a: 1000, r: 0, m: 'excl' }).raw).toBe(1000);
    expect(CALCULATOR_BY_ID.gst.run({ a: 0, r: 18, m: 'incl' }).raw).toBe(0);
    expect(() => CALCULATOR_BY_ID.gst.run({ a: -1, r: 18, m: 'excl' })).toThrow();
    expect(() => CALCULATOR_BY_ID.gst.run({ a: 1, r: 101, m: 'excl' })).toThrow();
  });
  it('rounds half-up to paise using decimal arithmetic', () => {
    expect(inr(1.005)).toBe('₹1.01');
    expect(inr(2.675)).toBe('₹2.68');
    expect(inr(0.004)).toBe('₹0.00');
    expect(inr(0.005)).toBe('₹0.01');
    expect(inr(1234567.891)).toBe('₹12,34,567.89');
    expect(inr(new Dec('99999999.995'))).toBe('₹10,00,00,000.00');
  });
});
