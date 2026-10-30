/**
 * Wrap a calculator definition with default verification metadata.
 * Status stays "testing" until formula and assumptions are checked against credible sources.
 * @typedef {{status:'draft'|'testing'|'verified'|'needs_review', sources:string[], effectiveDate:string|null, notes:string}} Verification
 */
export const defineCalculator = (definition) => ({
  verification: {
    status: 'testing',
    sources: [],
    effectiveDate: null,
    notes: 'Automated tests pass; formula and assumptions not yet checked against cited sources.',
  },
  ...definition,
});
