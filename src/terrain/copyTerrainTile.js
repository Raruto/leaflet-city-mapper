/**
 * Copy valid elevations from a DEM tile into an atlas and update its extrema.
 *
 * @param {Object} atlas Destination elevations and minimum and maximum values.
 * @param {Float32Array} values Source 256-by-256 elevation tile.
 * @param {number} start First destination index.
 * @param {number} columns Number of tile columns in the atlas.
 */
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
