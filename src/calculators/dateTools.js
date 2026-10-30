import { defineCalculator } from './define.js';
import { MS_PER_DAY, parseIsoDate, todayIso, yearsMonthsDays } from '../core/dates.js';

export const dateDiff = defineCalculator({
  id: 'date-diff',
  name: 'Days between dates',
  cat: 'Dates',
  desc: 'Difference between two dates.',
  alias: ['date difference', 'days between', 'dates', 'duration'],
  fields: [
    { k: 'a', l: 'Start date', t: 'date', v: '2024-01-01' },
    { k: 'b', l: 'End date', t: 'date', v: '2024-03-01' },
  ],
  run(values) {
    let start = parseIsoDate(values.a, 'Start date');
    let end = parseIsoDate(values.b, 'End date');
    const swapped = start > end;
    if (swapped) [start, end] = [end, start];
    const days = Math.round((end - start) / MS_PER_DAY);
    const [years, months, remainingDays] = yearsMonthsDays(start, end);
    return {
      raw: days,
      main: `${days} days`,
      rows: [['Days', days], ['Years / months / days', `${years}y ${months}m ${remainingDays}d`], ['Weeks', (days / 7).toFixed(2)]],
      formula: 'days = (end − start) ÷ 86,400,000 ms (UTC dates, leap years handled by the calendar)',
      steps: [],
      notes: swapped ? ['Dates were swapped so the difference is positive.'] : [],
    };
  },
});

export const age = defineCalculator({
  id: 'age',
  name: 'Age calculator',
  cat: 'Dates',
  desc: 'Age in years, months and days.',
  alias: ['age', 'birthday', 'date of birth', 'dob'],
  fields: [
    { k: 'a', l: 'Date of birth', t: 'date', v: '2000-01-15' },
    { k: 'b', l: 'As of', t: 'date', v: todayIso() },
  ],
  run(values) {
    const birth = parseIsoDate(values.a, 'Date of birth');
    const asOf = parseIsoDate(values.b, 'As-of date');
    if (birth > asOf) throw new Error('Date of birth is after the as-of date');
    const [years, months, days] = yearsMonthsDays(birth, asOf);
    return {
      raw: years,
      main: `${years} years, ${months} months, ${days} days`,
      rows: [['Total days', Math.round((asOf - birth) / MS_PER_DAY)]],
      formula: 'Calendar difference with borrowing from the previous month’s length',
      steps: [],
      notes: [],
    };
  },
});
