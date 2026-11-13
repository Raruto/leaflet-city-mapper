import { readCog } from './readCog.js';

/**
 * Read the numeric values of a supported TIFF directory entry.
 *
 * @param {Object} source Open COG byte source.
 * @param {DataView} entries Directory entry data.
 * @param {number} i Entry index.
 * @param {number} tag TIFF tag number.
 * @param {boolean} little Whether the TIFF uses little-endian byte order.
 *
 * @returns {Promise<Array<number>>} Decoded tag values.
 *
 * @throws {Error} If the tag type or value count is unsupported.
 */
export async function readCogTag(source, entries, i, tag, little) {
  const type = entries.getUint16(i * 12 + 2, little);
  const size = type === 3 ? 2 : type === 4 ? 4 : type === 12 ? 8 : 0;
  const length = entries.getUint32(i * 12 + 4, little);
  if (!size || !length || length > 1048576) throw /* alloc */ new Error(`Unsupported COG tag ${tag}`);
  const data = size * length <= 4 ? /* alloc */ new DataView(entries.buffer, i * 12 + 8, 4)
    : /* alloc */ new DataView(await readCog(source, entries.getUint32(i * 12 + 8, little), size * length));
  const values = /* alloc */ [];
  let j;
  for (j = 0; j < length; j++) values.push(type === 3 ? data.getUint16(j * size, little)
    : type === 4 ? data.getUint32(j * size, little) : data.getFloat64(j * size, little));
  return values;
}
