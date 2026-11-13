import { expectMvtWire } from './expectMvtWire.js';
import { numericMvtValue } from './numericMvtValue.js';
import { readMvtField } from './readMvtField.js';
import { readMvtGeometry } from './readMvtGeometry.js';
import { readMvtInteger } from './readMvtInteger.js';
import { readMvtNumber } from './readMvtNumber.js';
import { readMvtNumbers } from './readMvtNumbers.js';
import { skipMvtField } from './skipMvtField.js';

/**
 * Decode an MVT feature's ID, property tags and geometry.
 *
 * @param {Object} reader Feature message reader.
 * @param {Array<string>} keys Layer property keys.
 * @param {Array} values Layer property values.
 *
 * @returns {Object} Decoded feature.
 *
 * @throws {Error} If feature tags or geometry type are invalid.
 * @throws {Error} If a property index is outside the layer tables.
 */
export function readMvtFeature(reader, keys, values) {
  let id, type = 0, field, wire, i = 0;
  const tags = /* alloc */ [], commands = /* alloc */ [];
  while (reader.pos < reader.bytes.length) {
    [field, wire] = readMvtField(reader);
    if (field === 1) {
      expectMvtWire(wire, 0);
      id = numericMvtValue(readMvtInteger(reader));
    } else if (field === 2) readMvtNumbers(reader, wire, tags);
    else if (field === 3) {
      expectMvtWire(wire, 0);
      type = readMvtNumber(reader);
    } else if (field === 4) readMvtNumbers(reader, wire, commands);
    else skipMvtField(reader, wire);
  }
  if (tags.length % 2 || type > 3) throw /* alloc */ new Error('Invalid MVT feature');
  const properties = Object.create(null);
  for (; i < tags.length; i += 2) {
    if (tags[i] >= keys.length || tags[i + 1] >= values.length) {
      throw /* alloc */ new Error('Invalid MVT property index');
    }
    properties[keys[tags[i]]] = values[tags[i + 1]];
  }
  return /* alloc */ { id, type, properties, geometry: type ? readMvtGeometry(commands, type) : /* alloc */ [] };
}
