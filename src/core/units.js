/**
 * Unit table. `factor` converts to the category base (metre, square metre, kilogram).
 * Temperature units carry [toCelsius, fromCelsius] functions instead.
 */
export const UNITS = [
  ['km', 'Kilometre', 'len', 1000, ['km', 'kilometre', 'kilometres', 'kilometer', 'kilometers']],
  ['m', 'Metre', 'len', 1, ['m', 'metre', 'metres', 'meter', 'meters']],
  ['cm', 'Centimetre', 'len', 0.01, ['cm', 'centimetre', 'centimetres']],
  ['mi', 'Mile', 'len', 1609.344, ['mi', 'mile', 'miles']],
  ['ft', 'Foot', 'len', 0.3048, ['ft', 'foot', 'feet']],
  ['in', 'Inch', 'len', 0.0254, ['in', 'inch', 'inches']],
  ['acre', 'Acre', 'area', 4046.8564224, ['acre', 'acres']],
  ['ha', 'Hectare', 'area', 10000, ['ha', 'hectare', 'hectares']],
  ['sqm', 'Square metre', 'area', 1, ['sqm', 'square metre', 'square metres', 'square meter', 'square meters']],
  ['sqft', 'Square foot', 'area', 0.09290304, ['sqft', 'sq ft', 'square foot', 'square feet']],
  ['sqyd', 'Square yard', 'area', 0.83612736, ['sqyd', 'sq yd', 'square yard', 'square yards']],
  ['kg', 'Kilogram', 'mass', 1, ['kg', 'kilogram', 'kilograms']],
  ['g', 'Gram', 'mass', 0.001, ['g', 'gram', 'grams']],
  ['lb', 'Pound', 'mass', 0.45359237, ['lb', 'lbs', 'pound', 'pounds']],
  ['qtl', 'Quintal', 'mass', 100, ['quintal', 'quintals']],
  ['t', 'Tonne', 'mass', 1000, ['tonne', 'tonnes']],
  ['C', 'Celsius', 'temp', [(x) => x, (x) => x], ['celsius', 'c']],
  ['F', 'Fahrenheit', 'temp', [(x) => ((x - 32) * 5) / 9, (x) => (x * 9) / 5 + 32], ['fahrenheit', 'f']],
  ['K', 'Kelvin', 'temp', [(x) => x - 273.15, (x) => x + 273.15], ['kelvin', 'k']],
].map(([id, name, category, factor, aliases]) => ({ id, name, category, factor, aliases }));

export const UNIT_BY_ID = Object.fromEntries(UNITS.map((unit) => [unit.id, unit]));

/** Find a unit from free text such as "square feet" or "acres". Returns undefined if unknown. */
export const findUnit = (text) => UNITS.find((unit) => unit.aliases.includes(text.trim()));

/**
 * Convert a value between two units of the same category.
 * @throws {Error} For incompatible categories or temperatures below absolute zero.
 */
export function convertUnits(value, fromId, toId) {
  const from = UNIT_BY_ID[fromId];
  const to = UNIT_BY_ID[toId];
  if (from.category !== to.category) {
    throw new Error(`Cannot convert ${from.category} to ${to.category} — incompatible units`);
  }
  if (from.category === 'temp') {
    const celsius = from.factor[0](value);
    if (celsius < -273.15) throw new Error('Below absolute zero');
    return to.factor[1](celsius);
  }
  return (value * from.factor) / to.factor;
}
