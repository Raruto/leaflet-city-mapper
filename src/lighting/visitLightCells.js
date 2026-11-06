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
import { writeLightCell } from './writeLightCell.js';
