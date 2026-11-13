import { visitLightCells } from './visitLightCells.js';

/**
 * Visit covered grid cells for every packed light.
 *
 * @param {Float32Array[]} packed Arrays of packed light records.
 * @param {number} minX Grid origin on the x axis.
 * @param {number} minZ Grid origin on the z axis.
 * @param {number} cellSize Grid cell width.
 * @param {number} columns Number of grid columns.
 * @param {Uint32Array} offsets Per-cell counts or write offsets.
 * @param {Float32Array} [data] Output grid data; omitted during counting.
 */
export function visitCells(packed, minX, minZ, cellSize, columns, offsets, data) {
  let values, i;
  for (values of packed) for (i = 0; i < values.length; i += 8) {
    visitLightCells(values, i, minX, minZ, cellSize, columns, offsets, data);
  }
}
