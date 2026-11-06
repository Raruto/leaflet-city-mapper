export function copyTerrainTile(atlas, values, start, columns) {
  let row, column, value;
  for (row = 0; row < 256; row++) {
    for (column = 0; column < 256; column++) {
      value = values[row * 256 + column];
      if (!Number.isFinite(value) || value <= -1000) continue;
      atlas.elevations[start + row * columns * 256 + column] = value;
      atlas.low = Math.min(atlas.low, value);
      atlas.high = Math.max(atlas.high, value);
    }
  }
}
