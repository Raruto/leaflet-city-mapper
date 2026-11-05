import { visitCells } from './visitCells.js';

/** Pack world-space point lights into the shader's spatial grid. */
export function lightGrid(packed, maxBytes) {
  let count = 0;
  let values, i, value, key;
  for (values of packed) count += values.length / 8;
  const cellSize = 32;
  let data;
  if (count) {
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity;
    for (values of packed) for (i = 0; i < values.length; i += 8) {
      minX = Math.min(minX, values[i] - values[i + 3]);
      maxX = Math.max(maxX, values[i] + values[i + 3]);
      minZ = Math.min(minZ, values[i + 2] - values[i + 3]);
      maxZ = Math.max(maxZ, values[i + 2] + values[i + 3]);
    }
    const columns = Math.ceil((maxX - minX) / cellSize) + 1,
             rows = Math.ceil((maxZ - minZ) / cellSize) + 1;
    // Counting sort: count the lights of each cell, then fill each cell's slice.
    const counts = /* alloc */ new Uint32Array(columns * rows),
            next = /* alloc */ new Uint32Array(columns * rows);
    visitCells(packed, minX, minZ, cellSize, columns, counts);
    let entries = 0;
    for (value of counts) entries += value;
    const length = (2 + columns * rows + entries * 2) * 4;
    if (length * 4 > maxBytes) {
      throw /* alloc */ new Error('Streetlight grid exceeds GPU storage limit');
    }
    data = /* alloc */ new Float32Array(length);
    data[0] = minX; data[1] = minZ; data[2] = cellSize;
    data[3] = columns; data[4] = rows; data[5] = count;
    let offset = 2 + columns * rows;
    for (key = 0; key < counts.length; key++) if (counts[key]) {
      data[(2 + key) * 4] = next[key] = offset;
      data[(2 + key) * 4 + 1] = counts[key];
      offset += counts[key] * 2;
    }
    visitCells(packed, minX, minZ, cellSize, columns, next, data);
  } else data = /* alloc */ new Float32Array(8);

  return /* alloc */ { data, count };
}
