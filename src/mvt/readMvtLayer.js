import { expectMvtWire } from './expectMvtWire.js';
import { readMvtFeature } from './readMvtFeature.js';
import { readMvtField } from './readMvtField.js';
import { readMvtMessage } from './readMvtMessage.js';
import { readMvtNumber } from './readMvtNumber.js';
import { readMvtString } from './readMvtString.js';
import { readMvtValue } from './readMvtValue.js';
import { skipMvtField } from './skipMvtField.js';

/**
 * Decode an MVT layer and resolve its features against property tables.
 *
 * @param {Object} reader Layer message reader.
 *
 * @returns {Object} Layer name, extent and features.
 *
 * @throws {Error} If layer name, version or extent is invalid.
 */
export function readMvtLayer(reader) {
  let name, version, extent = 4096, field, wire, value, i = 0;
  const keys = /* alloc */ [], values = /* alloc */ [], features = /* alloc */ [];
  while (reader.pos < reader.bytes.length) {
    [field, wire] = readMvtField(reader);
    if (field === 1) name = readMvtString(reader, wire);
    else if (field === 2) features.push(readMvtMessage(reader, wire));
    else if (field === 3) keys.push(readMvtString(reader, wire));
    else if (field === 4) values.push(readMvtValue(readMvtMessage(reader, wire)));
    else if (field === 5 || field === 15) {
      expectMvtWire(wire, 0);
      value = readMvtNumber(reader);
      if (field === 5) extent = value;
      else version = value;
    } else skipMvtField(reader, wire);
  }
  if (!name || !/* alloc */ [1, 2].includes(version) || !extent || extent > 0xffffffff) {
    throw /* alloc */ new Error('Invalid MVT layer metadata');
  }
  for (; i < features.length; i++) features[i] = readMvtFeature(features[i], keys, values);
  return /* alloc */ { name, extent, features };
}
