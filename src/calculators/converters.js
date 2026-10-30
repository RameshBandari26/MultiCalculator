import { defineCalculator } from './define.js';
import { parseNumber } from '../core/validate.js';
import { sig } from '../core/format.js';
import { UNITS, UNIT_BY_ID, convertUnits } from '../core/units.js';

const unitOptions = UNITS.map((unit) => [unit.id, `${unit.name} (${unit.category})`]);

export const convert = defineCalculator({
  id: 'convert',
  name: 'Unit converter',
  cat: 'Converters',
  desc: 'Length, land area, mass and temperature.',
  alias: ['convert', 'unit', 'acre', 'hectare', 'square feet', 'km', 'miles', 'kg', 'celsius'],
  fields: [
    { k: 'x', l: 'Value', v: 2 },
    { k: 'a', l: 'From', t: 'select', o: unitOptions, v: 'acre' },
    { k: 'b', l: 'To', t: 'select', o: unitOptions, v: 'sqft' },
  ],
  run(values) {
    const value = parseNumber(values.x, 'Value');
    const result = convertUnits(value, values.a, values.b);
    return {
      raw: result,
      main: `${sig(result)} ${UNIT_BY_ID[values.b].name.toLowerCase()}`,
      rows: [['Result', sig(result)], ['Reverse check', sig(convertUnits(result, values.b, values.a))]],
      formula: 'value × (from-factor ÷ to-factor) via a base unit; temperature via °C',
      steps: [`${value} ${UNIT_BY_ID[values.a].name} → ${sig(result)} ${UNIT_BY_ID[values.b].name}`],
      notes: ['Acre = 4046.8564224 m² (international). Regional Indian land units (guntha, cent, bigha) vary by state and are intentionally not included until documented.'],
    };
  },
});
