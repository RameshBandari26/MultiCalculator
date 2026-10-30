import { CALCULATOR_BY_ID } from '../calculators/index.js';
import { evaluateExpression } from './parser.js';
import { convertUnits } from './units.js';
import { parseIsoDate } from './dates.js';
import { extractIntent } from '../search/intent.js';

const throws = (fn) => { try { fn(); return false; } catch { return true; } };

/** Runtime smoke checks shown in the footer (the full suite lives in src/tests). */
export function runSelfTests() {
  const run = (id, values) => CALCULATOR_BY_ID[id].run(values).raw;
  const checks = [
    ['18% of 2500 = 450', () => run('percent-of', { x: 18, y: 2500 }) === 450],
    ['Increase 2500 by 18% = 2950', () => Math.abs(run('percent-change', { y: 2500, x: 18, d: 'inc' }) - 2950) < 1e-9],
    ['EMI ₹8L, 9%, 5y ≈ ₹16,607 (±1)', () => Math.abs(run('emi', { p: 800000, r: 9, y: 5 }) - 16607) < 1],
    ['EMI amortisation ends at ≈0 balance', () => {
      const emi = run('emi', { p: 800000, r: 9, y: 5 });
      let balance = 800000;
      for (let i = 0; i < 60; i++) balance = balance * 1.0075 - emi;
      return Math.abs(balance) < 0.01;
    }],
    ['GST exclusive and inclusive agree', () => Math.abs(run('gst', { a: 1000, r: 18, m: 'excl' }) - 1180) < 1e-9 && Math.abs(run('gst', { a: 1180, r: 18, m: 'incl' }) - 1180) < 1e-9],
    ['1 acre = 43,560 sq ft', () => Math.abs(convertUnits(1, 'acre', 'sqft') - 43560) < 0.01],
    ['km→mi→km round trip', () => Math.abs(convertUnits(convertUnits(37.5, 'km', 'mi'), 'mi', 'km') - 37.5) < 1e-9],
    ['100°C = 212°F; incompatible units rejected', () => Math.abs(convertUnits(100, 'C', 'F') - 212) < 1e-9 && throws(() => convertUnits(1, 'kg', 'm'))],
    ['Jan 1 → Mar 1, 2024 = 60 days (leap year)', () => run('date-diff', { a: '2024-01-01', b: '2024-03-01' }) === 60],
    ['Invalid date 2023-02-30 rejected', () => throws(() => parseIsoDate('2023-02-30', 'x'))],
    ['2+3*4 = 14; 2^3^2 = 512; 50% = 0.5', () => evaluateExpression('2+3*4') === 14 && evaluateExpression('2^3^2') === 512 && evaluateExpression('50%') === 0.5],
    ['Division by zero and eval-style input rejected', () => throws(() => evaluateExpression('1/0')) && throws(() => evaluateExpression('alert(1)'))],
    ["Intent: 'increase' ≠ 'percent of'", () => extractIntent('18 percent of 2500').id === 'percent-of' && extractIntent('increase 2500 by 18 percent').id === 'percent-change'],
    ['Intent: EMI with lakh', () => { const i = extractIntent('EMI for 8 lakh at 9 percent for 5 years'); return i.id === 'emi' && i.vals.p === '800000'; }],
  ];
  return checks.map(([name, check]) => {
    let passed = false;
    try { passed = !!check(); } catch { passed = false; }
    return { name, passed };
  });
}
