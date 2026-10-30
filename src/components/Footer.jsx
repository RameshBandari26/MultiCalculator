import { useMemo } from 'react';
import { runSelfTests } from '../core/selfTest.js';

export default function Footer() {
  const results = useMemo(runSelfTests, []);
  const failed = results.filter((r) => !r.passed);
  return (
    <p className="muted mt-6" data-testid="self-test">
      Self-test: {results.length - failed.length}/{results.length} passed
      {failed.length ? ` — failing: ${failed.map((r) => r.name).join('; ')}` : ''}. All calculators are status “testing”;
      results are estimates, not tax, legal or investment advice. History and favourites are stored only in this browser.
    </p>
  );
}
