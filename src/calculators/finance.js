import { defineCalculator } from './define.js';
import { parseNumber } from '../core/validate.js';
import { inr } from '../core/format.js';
import { Dec } from '../core/decimal.js';
import { monthlyEmi, sipFutureValue, compoundAmount, gstBreakdown } from './financeLogic.js';

export const emi = defineCalculator({
  id: 'emi',
  name: 'Loan EMI',
  cat: 'Finance',
  desc: 'Monthly instalment, total payment and interest.',
  alias: ['emi', 'loan', 'home loan', 'car loan', 'instalment', 'installment'],
  fields: [
    { k: 'p', l: 'Loan amount (₹)', v: 800000 },
    { k: 'r', l: 'Annual interest rate (%)', v: 9 },
    { k: 'y', l: 'Tenure (years)', v: 5 },
  ],
  run(values) {
    const principal = parseNumber(values.p, 'Loan amount', { gt: 0, max: 1e12 });
    const annualRate = parseNumber(values.r, 'Interest rate', { min: 0, max: 100 });
    const years = parseNumber(values.y, 'Tenure', { gt: 0, max: 50 });
    const months = Math.round(years * 12);
    if (months < 1) throw new Error('Tenure must be at least 1 month');
    const instalment = monthlyEmi({ principal, annualRatePercent: annualRate, months });
    const totalPayment = instalment.mul(months);
    return {
      raw: instalment.toNumber(),
      main: inr(instalment),
      rows: [
        ['Monthly EMI', inr(instalment)],
        ['Total payment', inr(totalPayment)],
        ['Total interest', inr(totalPayment.minus(principal))],
        ['Instalments', months],
      ],
      formula: 'EMI = P·r·(1+r)ⁿ ÷ ((1+r)ⁿ − 1), r = annual rate ÷ 12 ÷ 100',
      steps: [`r = ${annualRate} ÷ 1200 = ${(annualRate / 1200).toPrecision(6)}`, `n = ${months} months`, `EMI = ${inr(instalment)}`],
      notes: [
        'Reducing-balance method, payments at month end, no fees or prepayment.',
        'Totals use the unrounded EMI; a lender’s schedule may differ by a few rupees due to per-instalment rounding.',
      ],
    };
  },
});

export const gst = defineCalculator({
  id: 'gst',
  name: 'GST calculator',
  cat: 'Finance',
  desc: 'Add or remove GST from a price.',
  alias: ['gst', 'tax', 'inclusive', 'exclusive', 'cgst', 'sgst'],
  fields: [
    { k: 'a', l: 'Amount (₹)', v: 1000 },
    { k: 'r', l: 'GST rate (%)', v: 18 },
    { k: 'm', l: 'Amount is', t: 'select', o: [['excl', 'Excluding GST'], ['incl', 'Including GST']], v: 'excl' },
  ],
  run(values) {
    const amount = parseNumber(values.a, 'Amount', { min: 0 });
    const rate = parseNumber(values.r, 'GST rate', { min: 0, max: 100 });
    const { base, tax, total } = gstBreakdown({ amount, ratePercent: rate, mode: values.m });
    return {
      raw: total.toNumber(),
      main: inr(total),
      rows: [
        ['Taxable value', inr(base)],
        ['GST', inr(tax)],
        ['CGST / SGST (intra-state)', `${inr(tax.div(2))} each`],
        ['Total', inr(total)],
      ],
      formula: 'GST = base × rate ÷ 100; base = total ÷ (1 + rate ÷ 100)',
      steps: [`Taxable value = ${inr(base)}`, `GST = ${inr(tax)}`],
      notes: ['Enter the rate applicable to your goods/service; rates are not hardcoded and change by notification.'],
    };
  },
});

export const sip = defineCalculator({
  id: 'sip',
  name: 'SIP projection',
  cat: 'Finance',
  desc: 'Estimated value of monthly investments.',
  alias: ['sip', 'mutual fund', 'investment', 'systematic investment'],
  fields: [
    { k: 'p', l: 'Monthly investment (₹)', v: 5000 },
    { k: 'r', l: 'Expected annual return (%)', v: 12 },
    { k: 'y', l: 'Years', v: 10 },
  ],
  run(values) {
    const monthly = parseNumber(values.p, 'Monthly investment', { gt: 0 });
    const annualRate = parseNumber(values.r, 'Return', { min: 0, max: 100 });
    const years = parseNumber(values.y, 'Years', { gt: 0, max: 60 });
    const months = Math.round(years * 12);
    if (months < 1) throw new Error('Investment period must be at least 1 month');
    const futureValue = sipFutureValue({ monthlyAmount: monthly, annualRatePercent: annualRate, months });
    const invested = new Dec(monthly).mul(months);
    return {
      raw: futureValue.toNumber(),
      main: inr(futureValue),
      rows: [['Estimated value', inr(futureValue)], ['Amount invested', inr(invested)], ['Estimated gain', inr(futureValue.minus(invested))]],
      formula: 'FV = P × ((1+i)ⁿ − 1) ÷ i × (1+i), i = annual rate ÷ 12',
      steps: [`i = ${(annualRate / 1200).toPrecision(6)}, n = ${months}`],
      notes: ['Assumes a constant return and investment at the start of each month. Market returns are not guaranteed; this is an illustration, not advice.'],
    };
  },
});

export const compound = defineCalculator({
  id: 'compound',
  name: 'Compound interest',
  cat: 'Finance',
  desc: 'Maturity amount with compounding.',
  alias: ['compound interest', 'maturity', 'fd', 'fixed deposit'],
  fields: [
    { k: 'p', l: 'Principal (₹)', v: 100000 },
    { k: 'r', l: 'Annual rate (%)', v: 7 },
    { k: 't', l: 'Years', v: 5 },
    { k: 'k', l: 'Compounding per year', v: 4 },
  ],
  run(values) {
    const principal = parseNumber(values.p, 'Principal', { min: 0 });
    const annualRate = parseNumber(values.r, 'Rate', { min: 0, max: 100 });
    const years = parseNumber(values.t, 'Years', { min: 0, max: 100 });
    const perYear = parseNumber(values.k, 'Compounding', { gt: 0, max: 365 });
    const amount = compoundAmount({ principal, annualRatePercent: annualRate, compoundingsPerYear: perYear, years });
    return {
      raw: amount.toNumber(),
      main: inr(amount),
      rows: [['Maturity amount', inr(amount)], ['Interest earned', inr(amount.minus(principal))]],
      formula: 'A = P(1 + r/k)^(kt)',
      steps: [`A = ${inr(amount)}`],
      notes: ['Ignores tax and fees.'],
    };
  },
});
