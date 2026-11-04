/** Float32 DEM atlas; missing samples retain the shader no-data sentinel. */

export function terrainAtlas(tiles, bounds) {
  const columns = bounds.max.x - bounds.min.x + 1, rows = bounds.max.y - bounds.min.y + 1;
  const elevations = new Float32Array(columns * rows * 65536).fill(-1e9);
  let low = Infinity, high = -Infinity;
  for (const [key, values] of tiles) {
    const [x, y] = key.split('/').map(Number);
    const start = (y - bounds.min.y) * 256 * columns * 256 + (x - bounds.min.x) * 256;
    for (let row = 0; row < 256; row++) {
      for (let column = 0; column < 256; column++) {
        const value = values[row * 256 + column];
        if (!Number.isFinite(value) || value <= -1000) continue;
        elevations[start + row * columns * 256 + column] = value;
        low = Math.min(low, value);
        high = Math.max(high, value);
      }
    }
  }
  return { elevations, low, high };
}
