import { writeLightCell } from './writeLightCell.js';

/**
 * Count or write a light into each spatial grid cell covered by its radius.
 *
 * @param {Float32Array} values Packed light records.
 * @param {number} i Starting index of the light record.
 * @param {number} minX Grid origin on the x axis.
 * @param {number} minZ Grid origin on the z axis.
 * @param {number} cellSize Grid cell width.
 * @param {number} columns Number of grid columns.
 * @param {Uint32Array} offsets Per-cell counts or write offsets.
 * @param {Float32Array} [data] Output grid data; omitted during counting.
 */
export function visitLightCells(values, i, minX, minZ, cellSize, columns, offsets, data) {
  const radius = values[i + 3], x = values[i] - minX, z = values[i + 2] - minZ;
  let y, c, key;
  for (y = Math.floor((z - radius) / cellSize); y <= Math.floor((z + radius) / cellSize); y++) {
    for (c = Math.floor((x - radius) / cellSize); c <= Math.floor((x + radius) / cellSize); c++) {
      key = y * columns + c;
      if (data) {
        writeLightCell(values, i, key, offsets, data);
      } else offsets[key]++;
    }
  }
}
