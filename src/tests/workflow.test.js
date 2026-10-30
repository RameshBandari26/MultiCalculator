import { describe, it, expect } from 'vitest';
import { runWorkflow, topologicalOrder } from '../workflows/engine.js';
import { pricingWorkflow } from '../workflows/pricingWorkflow.js';

const node = (id, dependsOn, compute) => ({ id, dependsOn, compute });

describe('workflow engine', () => {
  it('orders nodes after their dependencies regardless of declaration order', () => {
    const order = topologicalOrder([node('c', ['b'], () => 0), node('a', [], () => 0), node('b', ['a'], () => 0)]).map((n) => n.id);
    expect(order).toEqual(['a', 'b', 'c']);
  });
  it('rejects circular, unknown and duplicate nodes', () => {
    expect(() => topologicalOrder([node('a', ['b'], () => 0), node('b', ['a'], () => 0)])).toThrow('Circular dependency');
    expect(() => topologicalOrder([node('a', ['a'], () => 0)])).toThrow('Circular');
    expect(() => topologicalOrder([node('a', ['zzz'], () => 0)])).toThrow('unknown node');
    expect(() => topologicalOrder([node('a', [], () => 0), node('a', [], () => 0)])).toThrow('Duplicate');
  });
  it('passes typed values downstream and recalculates when inputs change', () => {
    const build = (x) => [node('double', [], () => x * 2), node('plusOne', ['double'], ({ double }) => double + 1)];
    expect(runWorkflow(build(5)).plusOne.value).toBe(11);
    expect(runWorkflow(build(10)).plusOne.value).toBe(21);
  });
  it('propagates a failure to downstream nodes instead of computing from missing data', () => {
    const results = runWorkflow([
      node('bad', [], () => { throw new Error('boom'); }),
      node('after', ['bad'], () => 1),
      node('independent', [], () => 2),
    ]);
    expect(results.bad.error).toBe('boom');
    expect(results.after.error).toMatch(/Upstream step "bad" failed/);
    expect(results.independent.value).toBe(2);
  });
});

describe('pricing workflow', () => {
  const base = { cost: 50000, shipping: 2000, quantity: 100, markupPercent: 30, gstPercent: 18 };
  it('matches hand calculation', () => {
    const r = pricingWorkflow(base);
    expect(r.unitCost.toString()).toBe('520');
    expect(r.priceBeforeTax.toString()).toBe('676');
    expect(r.gstPerUnit.toString()).toBe('121.68');
    expect(r.finalPrice.toString()).toBe('797.68');
    expect(r.profitPerUnit.toString()).toBe('156');
    expect(r.totalProfit.toString()).toBe('15600');
  });
  it('downstream values change when an upstream input changes', () => {
    expect(pricingWorkflow({ ...base, shipping: 3000 }).unitCost.toString()).toBe('530');
    expect(pricingWorkflow({ ...base, markupPercent: 0 }).profitPerUnit.toString()).toBe('0');
    expect(pricingWorkflow({ ...base, gstPercent: 0 }).finalPrice.toString()).toBe('676');
  });
  it('surfaces upstream failure (zero quantity) as an error', () => {
    expect(() => pricingWorkflow({ ...base, quantity: 0 })).toThrow();
  });
});
