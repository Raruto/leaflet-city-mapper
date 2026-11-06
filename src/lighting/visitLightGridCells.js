import { visitLightCells } from './visitLightCells.js';

export function visitCells(packed, minX, minZ, cellSize, columns, offsets, data) {
  let values, i;
  for (values of packed) for (i = 0; i < values.length; i += 8) {
    visitLightCells(values, i, minX, minZ, cellSize, columns, offsets, data);
  }
}
