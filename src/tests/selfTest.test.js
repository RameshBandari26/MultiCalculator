import { it, expect } from 'vitest';
import { runSelfTests } from '../core/selfTest.js';

it('all runtime self-tests pass', () => {
  const results = runSelfTests();
  expect(results.length).toBe(14);
  expect(results.filter((r) => !r.passed).map((r) => r.name)).toEqual([]);
});
