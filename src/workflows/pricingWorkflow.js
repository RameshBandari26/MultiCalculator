import { Dec } from '../core/decimal.js';
import { runWorkflow } from './engine.js';

/**
 * Cost → shipping → unit cost → markup → GST → final price → profit.
 * Inputs must already be validated numbers.
 * @returns {{unitCost, priceBeforeTax, gstPerUnit, finalPrice, profitPerUnit, totalProfit}} Decimals.
 */
export function pricingWorkflow({ cost, shipping, quantity, markupPercent, gstPercent }) {
  const results = runWorkflow([
    { id: 'unitCost', dependsOn: [], compute: () => {
      if (new Dec(quantity).isZero()) throw new Error('Quantity must be greater than 0');
      return new Dec(cost).plus(shipping).div(quantity);
    } },
    { id: 'priceBeforeTax', dependsOn: ['unitCost'], compute: ({ unitCost }) => unitCost.mul(new Dec(markupPercent).div(100).plus(1)) },
    { id: 'gstPerUnit', dependsOn: ['priceBeforeTax'], compute: ({ priceBeforeTax }) => priceBeforeTax.mul(gstPercent).div(100) },
    { id: 'finalPrice', dependsOn: ['priceBeforeTax', 'gstPerUnit'], compute: (u) => u.priceBeforeTax.plus(u.gstPerUnit) },
    { id: 'profitPerUnit', dependsOn: ['priceBeforeTax', 'unitCost'], compute: (u) => u.priceBeforeTax.minus(u.unitCost) },
    { id: 'totalProfit', dependsOn: ['profitPerUnit'], compute: ({ profitPerUnit }) => profitPerUnit.mul(quantity) },
  ]);
  const failed = Object.values(results).find((r) => r.error);
  if (failed) throw new Error(failed.error);
  return Object.fromEntries(Object.entries(results).map(([id, r]) => [id, r.value]));
}
