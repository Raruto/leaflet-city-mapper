/** Cumulative Hilbert ID for an archive tile. */

export function tileId(z, x, y) {
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y) || z < 0 || z > 26 ||
    x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) throw new Error('Invalid PMTiles tile coordinates');
  let id = (4 ** z - 1) / 3;
  const n = 2 ** z;
  // Same cumulative Hilbert ordering used by build/pmtiles.js.
  for (let s = n / 2; s >= 1; s /= 2) {
    const rx = (x & s) ? 1 : 0, ry = (y & s) ? 1 : 0;
    id += s * s * ((3 * rx) ^ ry);
    if (!ry) {
      if (rx) { x = n - 1 - x; y = n - 1 - y; }
      [x, y] = [y, x];
    }
  }
  return id;
}
