import { defineCalculator } from './define.js';
import { parseNumber } from '../core/validate.js';
import { inr } from '../core/format.js';
import { pricingWorkflow } from '../workflows/pricingWorkflow.js';

export const pricingFlow = defineCalculator({
  id: 'pricing-flow',
  name: 'Connected workflow: cost → selling price',
  cat: 'Workflow',
  desc: 'Purchase cost → shipping → unit cost → markup → GST → price → profit.',
  alias: ['selling price', 'workflow', 'markup', 'profit', 'unit cost', 'pricing'],
  fields: [
    { k: 'c', l: 'Purchase cost, total (₹)', v: 50000 },
    { k: 's', l: 'Shipping, total (₹)', v: 2000 },
    { k: 'q', l: 'Quantity (units)', v: 100 },
    { k: 'm', l: 'Markup on unit cost (%)', v: 30 },
    { k: 'g', l: 'GST rate (%)', v: 18 },
  ],
  run(values) {
    const cost = parseNumber(values.c, 'Cost', { min: 0 });
    const shipping = parseNumber(values.s, 'Shipping', { min: 0 });
    const quantity = parseNumber(values.q, 'Quantity', { gt: 0 });
    const markupPercent = parseNumber(values.m, 'Markup', { min: 0 });
    const gstPercent = parseNumber(values.g, 'GST', { min: 0, max: 100 });
    const r = pricingWorkflow({ cost, shipping, quantity, markupPercent, gstPercent });
    return {
      raw: r.finalPrice.toNumber(),
      main: inr(r.finalPrice),
      rows: [
        ['1. Unit cost', inr(r.unitCost)],
        ['2. Price before tax (after markup)', inr(r.priceBeforeTax)],
        ['3. GST per unit', inr(r.gstPerUnit)],
        ['4. Final selling price', inr(r.finalPrice)],
        ['5. Profit per unit (before GST)', inr(r.profitPerUnit)],
        ['6. Total profit', inr(r.totalProfit)],
      ],
      formula: 'unit = (cost + shipping) ÷ qty → price = unit × (1 + markup) → final = price × (1 + GST)',
      steps: [],
      notes: ['Each step feeds the next; changing any input recalculates all downstream steps. GST is treated as pass-through, not profit. A user-configurable workflow builder is not implemented yet.'],
    };
  },
});
