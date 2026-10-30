import { extractIntent } from './intent.js';
import { rankCalculators } from './rank.js';

/** Combined search: a confident intent (or null) plus ranked calculator candidates. */
export const searchCalculators = (query) => ({
  intent: query.trim() ? extractIntent(query) : null,
  results: rankCalculators(query),
});
