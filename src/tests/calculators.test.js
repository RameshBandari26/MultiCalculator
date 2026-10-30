import { describe, it, expect } from 'vitest';
import { CALCULATORS, CALCULATOR_BY_ID, defaultValues } from '../calculators/index.js';

const EXPECTED_IDS = ['percent-of', 'percent-change', 'emi', 'gst', 'sip', 'compound', 'convert', 'date-diff', 'age', 'scientific', 'pricing-flow'];
const run = (id, values) => CALCULATOR_BY_ID[id].run(defaultValues(CALCULATOR_BY_ID[id], values));

describe('registry', () => {
  it('preserves every original calculator id, in order, without duplicates', () => {
    expect(CALCULATORS.map((c) => c.id)).toEqual(EXPECTED_IDS);
  });
  it('every calculator runs with its defaults and returns the full result shape', () => {
    for (const c of CALCULATORS) {
      const r = c.run(defaultValues(c));
      expect(typeof r.main).toBe('string');
      expect(r.rows.length).toBeGreaterThan(0);
      expect(typeof r.formula).toBe('string');
      expect(Array.isArray(r.steps) && Array.isArray(r.notes)).toBe(true);
    }
  });
  it('no calculator is marked verified without sources', () => {
    for (const c of CALCULATORS) {
      expect(c.verification.status).toBe('testing');
      expect(c.verification.sources).toEqual([]);
    }
  });
});

describe('percentages', () => {
  it('computes percent of, including zero, negative and large values', () => {
    expect(run('percent-of', { x: 18, y: 2500 }).raw).toBe(450);
    expect(run('percent-of', { x: 18, y: 2500 }).main).toBe('450');
    expect(run('percent-of', { x: 0, y: 2500 }).raw).toBe(0);
    expect(run('percent-of', { x: 12.5, y: 80 }).raw).toBe(10);
    expect(run('percent-of', { x: -10, y: 50 }).raw).toBe(-5);
    expect(run('percent-of', { x: 50, y: 1e15 }).raw).toBe(5e14);
    expect(() => run('percent-of', { x: '', y: 5 })).toThrow('required');
    expect(() => run('percent-of', { x: 'abc', y: 5 })).toThrow('valid number');
  });
  it('increase and decrease are not inverses of each other', () => {
    expect(run('percent-change', { y: 2500, x: 18, d: 'inc' }).raw).toBeCloseTo(2950, 9);
    expect(run('percent-change', { y: 2500, x: 18, d: 'dec' }).raw).toBeCloseTo(2050, 9);
    const up = run('percent-change', { y: 100, x: 20, d: 'inc' }).raw;
    expect(run('percent-change', { y: up, x: 20, d: 'dec' }).raw).toBeCloseTo(96, 9);
  });
  it('handles boundaries', () => {
    expect(run('percent-change', { y: 500, x: 0, d: 'inc' }).raw).toBe(500);
    expect(run('percent-change', { y: 500, x: 100, d: 'dec' }).raw).toBe(0);
    expect(() => run('percent-change', { y: 500, x: 101, d: 'dec' })).toThrow('more than 100%');
    expect(() => run('percent-change', { y: 500, x: -5, d: 'inc' })).toThrow('at least 0');
  });
});

describe('converter calculator', () => {
  it('converts 2 acres to square feet and shows a reverse check', () => {
    const r = run('convert', { x: 2, a: 'acre', b: 'sqft' });
    expect(r.raw).toBeCloseTo(87120, 6);
    expect(r.rows[1][0]).toBe('Reverse check');
  });
  it('rejects incompatible units and bad values', () => {
    expect(() => run('convert', { x: 5, a: 'kg', b: 'km' })).toThrow(/incompatible/);
    expect(() => run('convert', { x: '', a: 'kg', b: 'g' })).toThrow('required');
  });
});

describe('dates', () => {
  it('counts days across leap and non-leap years', () => {
    expect(run('date-diff', { a: '2024-01-01', b: '2024-03-01' }).raw).toBe(60);
    expect(run('date-diff', { a: '2023-01-01', b: '2023-03-01' }).raw).toBe(59);
    expect(run('date-diff', { a: '2024-01-01', b: '2025-01-01' }).raw).toBe(366);
    expect(run('date-diff', { a: '2024-05-05', b: '2024-05-05' }).raw).toBe(0);
  });
  it('swaps reversed dates and says so', () => {
    const r = run('date-diff', { a: '2024-03-01', b: '2024-01-01' });
    expect(r.raw).toBe(60);
    expect(r.notes[0]).toMatch(/swapped/);
  });
  it('rejects impossible and malformed dates, including century leap rules', () => {
    expect(() => run('date-diff', { a: '2023-02-30', b: '2024-01-01' })).toThrow('not a real calendar date');
    expect(() => run('date-diff', { a: '2023-02-29', b: '2024-01-01' })).toThrow();
    expect(() => run('date-diff', { a: '1900-02-29', b: '2024-01-01' })).toThrow();
    expect(run('date-diff', { a: '2000-02-29', b: '2024-01-01' }).raw).toBeGreaterThan(0);
    expect(() => run('date-diff', { a: '', b: '2024-01-01' })).toThrow('valid date');
  });
  it('computes age in years, months and days', () => {
    const r = run('age', { a: '2000-01-15', b: '2024-03-10' });
    expect(r.main).toBe('24 years, 1 months, 24 days');
    expect(r.rows[0][1]).toBe(8821);
    expect(run('age', { a: '2000-02-29', b: '2001-02-28' }).main).toBe('0 years, 11 months, 30 days');
    expect(() => run('age', { a: '2030-01-01', b: '2024-01-01' })).toThrow('after');
  });
});

describe('scientific calculator and pricing workflow', () => {
  it('evaluates expressions and reports errors', () => {
    expect(run('scientific', { e: '2+3*4' }).main).toBe('14');
    expect(() => run('scientific', { e: '1/0' })).toThrow('Division by zero');
  });
  it('pricing workflow reproduces hand-calculated values', () => {
    const r = run('pricing-flow', {});
    expect(r.rows.map((x) => x[1])).toEqual(['₹520.00', '₹676.00', '₹121.68', '₹797.68', '₹156.00', '₹15,600.00']);
  });
  it('pricing workflow validates inputs', () => {
    expect(() => run('pricing-flow', { q: 0 })).toThrow('greater than 0');
    expect(() => run('pricing-flow', { g: 150 })).toThrow('at most 100');
    expect(() => run('pricing-flow', { c: -1 })).toThrow();
  });
});
