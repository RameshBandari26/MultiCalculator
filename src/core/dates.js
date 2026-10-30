export const MS_PER_DAY = 86_400_000;

/** Today as YYYY-MM-DD (UTC). */
export const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Parse a YYYY-MM-DD string into a UTC Date, rejecting impossible calendar dates (e.g. 2023-02-30).
 * @throws {Error}
 */
export function parseIsoDate(text, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
  if (!match) throw new Error(`${label} must be a valid date`);
  const date = new Date(Date.UTC(+match[1], match[2] - 1, +match[3]));
  if (date.getUTCMonth() !== match[2] - 1 || date.getUTCDate() !== +match[3]) {
    throw new Error(`${label} is not a real calendar date`);
  }
  return date;
}

/** Calendar difference (years, months, days) between two UTC dates, start <= end. */
export function yearsMonthsDays(start, end) {
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months--;
    days += new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) { years--; months += 12; }
  return [years, months, days];
}
