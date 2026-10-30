import { describe, it, expect } from 'vitest';
import { evaluateExpression as ev } from '../core/parser.js';

describe('expression parser', () => {
  it('respects precedence, parentheses and right-associative powers', () => {
    expect(ev('2+3*4')).toBe(14);
    expect(ev('(2+3)*4')).toBe(20);
    expect(ev('2^3^2')).toBe(512);
    expect(ev('-2^2')).toBe(-4);
    expect(ev('10-4-3')).toBe(3);
    expect(ev('8/2/2')).toBe(2);
  });
  it('supports percent, functions and constants', () => {
    expect(ev('50%')).toBe(0.5);
    expect(ev('200*10%')).toBe(20);
    expect(ev('sqrt(16)')).toBe(4);
    expect(ev('abs(-7.5)')).toBe(7.5);
    expect(ev('log(1000)')).toBeCloseTo(3, 12);
    expect(ev('ln(e)')).toBeCloseTo(1, 12);
    expect(ev('sin(pi/2)')).toBeCloseTo(1, 12);
    expect(ev('cos(0)')).toBe(1);
    expect(ev('2 * pi')).toBeCloseTo(6.283185307179586, 12);
    expect(ev('1.5e3+1')).toBe(1501);
  });
  it('handles zero and negative operands', () => {
    expect(ev('0*5')).toBe(0);
    expect(ev('-3+3')).toBe(0);
    expect(ev('0^0')).toBe(1);
  });
  it('rejects invalid, unsafe or unbounded input', () => {
    expect(() => ev('1/0')).toThrow('Division by zero');
    expect(() => ev('sqrt(-1)')).toThrow(/negative/);
    expect(() => ev('ln(0)')).toThrow(/positive/);
    expect(() => ev('log(-5)')).toThrow(/positive/);
    expect(() => ev('')).toThrow();
    expect(() => ev('2+')).toThrow('Unexpected end');
    expect(() => ev('(2+3')).toThrow('Missing closing');
    expect(() => ev('2 3')).toThrow();
    expect(() => ev('alert(1)')).toThrow();
    expect(() => ev('foo')).toThrow();
    expect(() => ev('2; 3')).toThrow('Unsupported');
    expect(() => ev('sin 2')).toThrow('needs parentheses');
    expect(() => ev('9'.repeat(201))).toThrow('too long');
    expect(() => ev('('.repeat(60) + '1' + ')'.repeat(60))).toThrow('deeply nested');
    expect(() => ev('10^400')).toThrow('not a finite');
  });
});
