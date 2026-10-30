import { evaluateExpression } from '../core/parser.js';
import { fmt } from '../core/format.js';
import { findUnit } from '../core/units.js';

const NUM = '(\\d+(?:\\.\\d+)?)';

/** Lower-case, strip commas, expand "8 lakh" / "1 crore", and unify "percent" to "%". */
export function normalizeQuery(raw) {
  return raw.toLowerCase().replace(/,/g, '')
    .replace(/(\d+(?:\.\d+)?)\s*lakhs?/g, (_, n) => +(n * 1e5).toFixed(2))
    .replace(/(\d+(?:\.\d+)?)\s*crores?/g, (_, n) => +(n * 1e7).toFixed(2))
    .replace(/\bper ?cent\b|\bpercent\b/g, '%')
    .trim();
}

/**
 * Extract a confident, supported intent from a query, or null.
 * "X percent of Y" and "increase Y by X percent" are deliberately different operations.
 * @returns {{id:string, vals:Record<string,string>, label:string}|null}
 */
export function extractIntent(raw) {
  const q = normalizeQuery(raw);
  let m;
  if ((m = new RegExp(`${NUM}\\s*%\\s*of\\s*${NUM}`).exec(q))) {
    return { id: 'percent-of', vals: { x: m[1], y: m[2] }, label: `${m[1]}% of ${m[2]}` };
  }
  if ((m = new RegExp(`(increase|decrease|reduce)\\s+${NUM}\\s+by\\s+${NUM}\\s*%`).exec(q))) {
    return { id: 'percent-change', vals: { y: m[2], x: m[3], d: m[1] === 'increase' ? 'inc' : 'dec' }, label: `${m[1]} ${m[2]} by ${m[3]}%` };
  }
  if ((m = new RegExp(`emi.*?${NUM}.*?${NUM}\\s*%.*?${NUM}\\s*(?:year|yr)`).exec(q))) {
    return { id: 'emi', vals: { p: m[1], r: m[2], y: m[3] }, label: `EMI: ₹${fmt(+m[1], 0)} at ${m[2]}% for ${m[3]} years` };
  }
  if ((m = new RegExp(`convert\\s+${NUM}\\s*([a-z ]+?)\\s+to\\s+([a-z ]+)$`).exec(q))) {
    const from = findUnit(m[2]);
    const to = findUnit(m[3]);
    if (from && to) return { id: 'convert', vals: { x: m[1], a: from.id, b: to.id }, label: `Convert ${m[1]} ${from.name} to ${to.name}` };
  }
  if (/[+\-*/^]|sqrt|sin\(|cos\(|tan\(|log|ln\(/.test(q) && /\d/.test(q)) {
    try {
      evaluateExpression(raw);
      return { id: 'scientific', vals: { e: raw }, label: `Expression: ${raw}` };
    } catch { /* not a valid expression: fall through to ranked search */ }
  }
  return null;
}
