/** Float32 DEM atlas; missing samples retain the shader no-data sentinel. */

export function terrainAtlas(tiles, bounds) {
  const columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
  const elevations = /* allocation: required -- Each returned atlas owns its DEM upload buffer independently of later atlas builds. */ new Float32Array(columns * rows * 65536).fill(-1e9);
  let low = Infinity, high = -Infinity;
  let key, values, coordinates, x, y, start, row, column, value;
  for ([key, values] of tiles) {
    coordinates = key.split('/');
    x = Number(coordinates[0]), y = Number(coordinates[1]);
    start = (y - bounds.min.y) * 256 * columns * 256 + (x - bounds.min.x) * 256;
    for (row = 0; row < 256; row++) {
      for (column = 0; column < 256; column++) {
        value = values[row * 256 + column];
        if (!Number.isFinite(value) || value <= -1000) continue;
        elevations[start + row * columns * 256 + column] = value;
        low = Math.min(low, value);
        high = Math.max(high, value);
      }
    }
  }
  return /* allocation: required -- Each caller owns its returned DEM buffer and elevation-range result. */ { elevations, low, high };
}
