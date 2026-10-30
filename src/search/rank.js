import { CALCULATORS } from '../calculators/index.js';

/** Levenshtein edit distance. */
export function levenshtein(a, b) {
  const row = [...Array(b.length + 1).keys()];
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] !== b[j - 1] ? 1 : 0));
      previous = temp;
    }
  }
  return row[b.length];
}

/** Filler words ignored when scoring, so "tell me a joke" cannot match on the word "a". */
const STOP_WORDS = new Set(['a', 'an', 'the', 'of', 'to', 'for', 'me', 'my', 'is', 'in', 'on', 'at', 'by', 'and', 'or', 'what', 'how', 'tell', 'do', 'i', 'it', 'you', 'can', 'please']);

/**
 * Rank calculators for a free-text query: exact word match (3), typo match (1.5),
 * prefix match (1), plus a bonus when the query appears in the name/aliases.
 * @returns {object[]} Calculators, best first. Empty when nothing matches.
 */
export function rankCalculators(query) {
  const tokens = query.toLowerCase().split(/\W+/).filter((word) => word && !STOP_WORDS.has(word));
  if (!tokens.length) return [];
  return CALCULATORS.map((calculator) => {
    const words = `${calculator.name} ${calculator.alias.join(' ')} ${calculator.desc}`.toLowerCase().split(/\W+/);
    let score = 0;
    for (const token of tokens) {
      if (words.includes(token)) score += 3;
      else if (token.length > 3 && words.some((w) => w.length > 3 && levenshtein(token, w) <= 1)) score += 1.5;
      else if (token.length > 2 && words.some((w) => w.startsWith(token))) score += 1;
    }
    if (`${calculator.name}${calculator.alias.join(' ')}`.toLowerCase().includes(query.toLowerCase())) score += 4;
    return { calculator, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.calculator);
}
