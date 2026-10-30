import { describe, it, expect } from 'vitest';
import { extractIntent, normalizeQuery } from '../search/intent.js';
import { searchCalculators } from '../search/index.js';
import { CALCULATOR_BY_ID, defaultValues } from '../calculators/index.js';

const resultOf = (query) => {
  const intent = extractIntent(query);
  const calculator = CALCULATOR_BY_ID[intent.id];
  return calculator.run(defaultValues(calculator, intent.vals));
};

describe('intent distinctions', () => {
  it('"18 percent of 2500" is a percentage-of operation = 450', () => {
    expect(extractIntent('18 percent of 2500').id).toBe('percent-of');
    expect(resultOf('Find 18 percent of 2500').raw).toBe(450);
    expect(resultOf('18% of 2500').raw).toBe(450);
  });
  it('"increase 2500 by 18 percent" is a different operation = 2950', () => {
    expect(extractIntent('increase 2500 by 18 percent').id).toBe('percent-change');
    expect(resultOf('Increase 2500 by 18 percent').raw).toBeCloseTo(2950, 9);
    expect(resultOf('decrease 2500 by 18 percent').raw).toBeCloseTo(2050, 9);
    expect(extractIntent('reduce 1000 by 10%').vals.d).toBe('dec');
  });
  it('EMI with lakh values extracts amount, rate and tenure', () => {
    const intent = extractIntent('Calculate EMI for 8 lakh at 9 percent for 5 years');
    expect(intent.id).toBe('emi');
    expect(intent.vals).toEqual({ p: '800000', r: '9', y: '5' });
    expect(resultOf('EMI for 8 lakh at 9 percent for 5 years').raw).toBeCloseTo(16606.684181, 5);
    expect(extractIntent('emi 1.5 crore at 8.5% for 20 yr').vals.p).toBe('15000000');
  });
  it('conversion extracts value and units', () => {
    const intent = extractIntent('convert 2 acres to square feet');
    expect(intent).toMatchObject({ id: 'convert', vals: { x: '2', a: 'acre', b: 'sqft' } });
    expect(resultOf('convert 2 acres to square feet').raw).toBeCloseTo(87120, 6);
  });
  it('lakh/crore normalisation avoids floating-point noise', () => {
    expect(normalizeQuery('1.1 lakh')).toBe('110000');
    expect(normalizeQuery('2 crore')).toBe('20000000');
    expect(normalizeQuery('5 per cent')).toBe('5 %');
  });
  it('recognises safe expressions', () => {
    expect(extractIntent('2+3*4').id).toBe('scientific');
    expect(extractIntent('sqrt(16)').id).toBe('scientific');
  });
});

describe('unsupported and ambiguous requests', () => {
  it('returns no intent for incomplete or unsupported phrasing', () => {
    expect(extractIntent('18 percent')).toBeNull();
    expect(extractIntent('increase 2500')).toBeNull();
    expect(extractIntent('EMI for 8 lakh at 9 percent')).toBeNull();
    expect(extractIntent('convert 2 acres to parsecs')).toBeNull();
    expect(extractIntent('convert acres to square feet')).toBeNull();
    expect(extractIntent('alert(1)')).toBeNull();
    expect(extractIntent('1/0')).toBeNull();
    expect(extractIntent('2 +')).toBeNull();
    expect(extractIntent('what is the weather')).toBeNull();
  });
  it('an unrelated question matches nothing rather than guessing', () => {
    const { intent, results } = searchCalculators('tell me a joke');
    expect(intent).toBeNull();
    expect(results).toEqual([]);
  });
  it('ambiguous "percent" lists both percentage calculators without choosing one', () => {
    const { intent, results } = searchCalculators('percent');
    expect(intent).toBeNull();
    const ids = results.map((c) => c.id);
    expect(ids).toContain('percent-of');
    expect(ids).toContain('percent-change');
  });
  it('a supported intent can still fail validation at run time (incompatible units)', () => {
    expect(() => resultOf('convert 5 kg to km')).toThrow(/incompatible/);
  });
  it('empty and whitespace queries produce nothing', () => {
    expect(searchCalculators('')).toEqual({ intent: null, results: [] });
    expect(searchCalculators('   ').results).toEqual([]);
  });
});

describe('ranking and typo tolerance', () => {
  const top = (q) => searchCalculators(q).results[0]?.id;
  it('finds calculators by name, alias and typo', () => {
    expect(top('emi')).toBe('emi');
    expect(top('loan')).toBe('emi');
    expect(top('age')).toBe('age');
    expect(top('compund intrest')).toBe('compound');
    expect(top('sellng price')).toBe('pricing-flow');
    expect(top('gst')).toBe('gst');
    expect(top('sip')).toBe('sip');
    expect(top('days between')).toBe('date-diff');
  });
});
