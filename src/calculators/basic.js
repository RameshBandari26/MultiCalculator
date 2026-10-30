import { defineCalculator } from './define.js';
import { parseNumber } from '../core/validate.js';
import { fmt, sig } from '../core/format.js';

export const percentOf = defineCalculator({
  id: 'percent-of',
  name: 'Percentage of a number',
  cat: 'Basic',
  desc: 'Find X% of Y.',
  alias: ['percentage', 'percent of', 'what is percent'],
  fields: [
    { k: 'x', l: 'Percentage (%)', v: 18 },
    { k: 'y', l: 'Of number', v: 2500 },
  ],
  run(values) {
    const percentage = parseNumber(values.x, 'Percentage');
    const number = parseNumber(values.y, 'Number');
    const result = (percentage * number) / 100;
    return {
      raw: result,
      main: fmt(result, 4).replace(/\.?0+$/, ''),
      rows: [['Result', sig(result)]],
      formula: 'result = (X ÷ 100) × Y',
      steps: [`${percentage}% of ${number} = (${percentage} ÷ 100) × ${number} = ${sig(result)}`],
      notes: ['Pure arithmetic; displayed to 10 significant digits.'],
    };
  },
});

export const percentChange = defineCalculator({
  id: 'percent-change',
  name: 'Increase / decrease by percentage',
  cat: 'Basic',
  desc: 'Raise or lower a value by a percentage.',
  alias: ['increase by percent', 'decrease by percent', 'discount', 'sale price', 'markup'],
  fields: [
    { k: 'y', l: 'Original value', v: 2500 },
    { k: 'x', l: 'Percentage (%)', v: 18 },
    { k: 'd', l: 'Direction', t: 'select', o: [['inc', 'Increase'], ['dec', 'Decrease']], v: 'inc' },
  ],
  run(values) {
    const original = parseNumber(values.y, 'Value');
    const percentage = parseNumber(values.x, 'Percentage', { min: 0 });
    if (values.d === 'dec' && percentage > 100) throw new Error('Cannot decrease by more than 100%');
    const result = original * (1 + (values.d === 'dec' ? -percentage : percentage) / 100);
    return {
      raw: result,
      main: sig(result),
      rows: [['Result', sig(result)], ['Change', sig(result - original)]],
      formula: 'result = value × (1 ± X ÷ 100)',
      steps: [`${original} × (1 ${values.d === 'dec' ? '−' : '+'} ${percentage}/100) = ${sig(result)}`],
      notes: ['An increase followed by the same percentage decrease does not return to the original value.'],
    };
  },
});
