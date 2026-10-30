import { describe, it, expect } from 'vitest';
import { UNITS, convertUnits, findUnit } from '../core/units.js';

describe('unit conversion', () => {
  it('matches published definitions', () => {
    expect(convertUnits(1, 'acre', 'sqft')).toBeCloseTo(43560, 6);
    expect(convertUnits(1, 'ha', 'sqm')).toBe(10000);
    expect(convertUnits(1, 'ha', 'acre')).toBeCloseTo(2.4710538, 6);
    expect(convertUnits(1, 'mi', 'km')).toBeCloseTo(1.609344, 9);
    expect(convertUnits(1, 'kg', 'lb')).toBeCloseTo(2.20462262, 7);
    expect(convertUnits(1, 'qtl', 'kg')).toBe(100);
    expect(convertUnits(12, 'in', 'ft')).toBeCloseTo(1, 12);
  });
  it('converts temperature including boundaries', () => {
    expect(convertUnits(0, 'C', 'F')).toBe(32);
    expect(convertUnits(100, 'C', 'F')).toBeCloseTo(212, 12);
    expect(convertUnits(-40, 'C', 'F')).toBeCloseTo(-40, 12);
    expect(convertUnits(0, 'K', 'C')).toBeCloseTo(-273.15, 12);
    expect(convertUnits(-273.15, 'C', 'K')).toBeCloseTo(0, 12);
  });
  it('handles zero and negative lengths', () => {
    expect(convertUnits(0, 'km', 'mi')).toBe(0);
    expect(convertUnits(-5, 'm', 'cm')).toBeCloseTo(-500, 9);
  });
  it('rejects incompatible units and temperatures below absolute zero', () => {
    expect(() => convertUnits(1, 'kg', 'm')).toThrow(/incompatible/);
    expect(() => convertUnits(1, 'acre', 'km')).toThrow(/incompatible/);
    expect(() => convertUnits(-300, 'C', 'F')).toThrow('absolute zero');
    expect(() => convertUnits(-1, 'K', 'C')).toThrow('absolute zero');
  });
  it('round-trips every same-category unit pair', () => {
    for (const a of UNITS) for (const b of UNITS) {
      if (a.category !== b.category) continue;
      const back = convertUnits(convertUnits(123.456, a.id, b.id), b.id, a.id);
      expect(Math.abs(back - 123.456)).toBeLessThan(1e-9 * 123.456);
    }
  });
  it('finds units by alias and returns undefined for unknown names', () => {
    expect(findUnit('square feet').id).toBe('sqft');
    expect(findUnit(' acres ').id).toBe('acre');
    expect(findUnit('parsecs')).toBeUndefined();
  });
});
