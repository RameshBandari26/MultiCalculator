/**
 * Parse and validate a numeric form value.
 * @param {string|number} value Raw input (commas allowed).
 * @param {string} label Human-readable field name used in error messages.
 * @param {{min?:number, gt?:number, max?:number}} [limits]
 * @returns {number}
 * @throws {Error} With a user-facing message when the value is missing or out of range.
 */
export function parseNumber(value, label, limits = {}) {
  if (value === '' || value == null) throw new Error(`${label} is required`);
  const number = Number(String(value).replace(/,/g, ''));
  if (!Number.isFinite(number)) throw new Error(`${label} must be a valid number`);
  if (limits.min != null && number < limits.min) throw new Error(`${label} must be at least ${limits.min}`);
  if (limits.gt != null && number <= limits.gt) throw new Error(`${label} must be greater than ${limits.gt}`);
  if (limits.max != null && number > limits.max) throw new Error(`${label} must be at most ${limits.max}`);
  return number;
}
