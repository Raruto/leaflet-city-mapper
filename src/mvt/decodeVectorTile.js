import { createMvtReader } from './createMvtReader.js';
import { readMvtField } from './readMvtField.js';
import { readMvtLayer } from './readMvtLayer.js';
import { readMvtMessage } from './readMvtMessage.js';
import { skipMvtField } from './skipMvtField.js';

/**
 * Decode an uncompressed MVT ArrayBuffer/Uint8Array into tile-local layers.
 * Feature types: 0 unknown, 1 points, 2 lines, 3 polygon rings (including holes).
 * Integers outside JavaScript's safe range are returned as decimal strings.
 *
 * @param {ArrayBuffer|Uint8Array} buffer Uncompressed tile data.
 *
 * @returns {Array<Object>} Decoded tile layers.
 *
 * @throws {TypeError} If the input is not a supported byte buffer.
 * @throws {Error} If layer names are duplicated.
 */
export function decodeVectorTile(buffer) {
  if (!(buffer instanceof ArrayBuffer) && !(buffer instanceof Uint8Array)) {
    throw /* alloc */ new TypeError('MVT input must be an ArrayBuffer or Uint8Array');
  }
  const bytes = buffer instanceof Uint8Array ? buffer : /* alloc */ new Uint8Array(buffer);
  const reader = createMvtReader(bytes);
  const layers = /* alloc */ [], names = /* alloc */ new Set();
  let field, wire, layer;
  while (reader.pos < reader.bytes.length) {
    [field, wire] = readMvtField(reader);
    if (field !== 3) {
      skipMvtField(reader, wire);
      continue;
    }
    layer = readMvtLayer(readMvtMessage(reader, wire));
    if (names.has(layer.name)) throw /* alloc */ new Error('Duplicate MVT layer name');
    names.add(layer.name);
    layers.push(layer);
  }
  return layers;
}
