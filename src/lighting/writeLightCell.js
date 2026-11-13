/**
 * Copy a packed light record into a cell and advance that cell's write offset.
 *
 * @param {Float32Array} values Packed light records.
 * @param {number} i Starting index of the light record.
 * @param {number} key Grid cell index.
 * @param {Uint32Array} offsets Per-cell write offsets in vec4 units.
 * @param {Float32Array} data Output grid data.
 */
export function writeLightCell(values, i, key, offsets, data) {
  let j, o;
  for (j = 0, o = offsets[key] * 4; j < 8; j++) data[o + j] = values[i + j];
  offsets[key] += 2;
}
