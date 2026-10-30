import { percentOf, percentChange } from './basic.js';
import { emi, gst, sip, compound } from './finance.js';
import { convert } from './converters.js';
import { dateDiff, age } from './dateTools.js';
import { scientific } from './scientific.js';
import { pricingFlow } from './pricingFlow.js';

/** Calculator registry. Order is the display order; ids are stable public URLs. */
export const CALCULATORS = [percentOf, percentChange, emi, gst, sip, compound, convert, dateDiff, age, scientific, pricingFlow];
export const CALCULATOR_BY_ID = Object.fromEntries(CALCULATORS.map((calculator) => [calculator.id, calculator]));
export const getCalculator = (id) => CALCULATOR_BY_ID[id];

/** Default form values for a calculator, optionally overridden (e.g. by search intent). */
export const defaultValues = (calculator, overrides = {}) =>
  ({ ...Object.fromEntries(calculator.fields.map((field) => [field.k, field.v])), ...overrides });
