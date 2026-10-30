import { defineCalculator } from './define.js';
import { evaluateExpression } from '../core/parser.js';
import { sig } from '../core/format.js';

export const scientific = defineCalculator({
  id: 'scientific',
  name: 'Scientific / expression calculator',
  cat: 'Scientific',
  desc: 'Evaluate expressions safely.',
  alias: ['calculator', 'expression', 'sqrt', 'sin', 'log', 'scientific', 'arithmetic'],
  fields: [{ k: 'e', l: 'Expression', t: 'text', v: '2+3*4' }],
  run(values) {
    const result = evaluateExpression(String(values.e || ''));
    return {
      raw: result,
      main: sig(result),
      rows: [['Result', sig(result)]],
      formula: 'Parsed with a bounded recursive-descent parser (no eval)',
      steps: [],
      notes: ['Supports + − × ÷ ^ % ( ), sqrt sin cos tan log ln abs, pi, e. Trig uses radians. Floating-point (double) arithmetic: results are numerical approximations.'],
    };
  },
});
