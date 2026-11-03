/** Bilinear DEM sampling, with the original first-valid-neighbour no-data rule. */

export function terrainElevation(point, tiles) {
  const x = point.x - 0.5, y = point.y - 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const sample = (px, py) => {
    const tileX = Math.floor(px / 256), tileY = Math.floor(py / 256);
    const tile = tiles.get(`${tileX}/${tileY}`);
    if (!tile) return null;
    const elevation = tile[(py - tileY * 256) * 256 + px - tileX * 256];
    return Number.isFinite(elevation) && elevation > -1000 ? elevation : null;
  };
  const values = [sample(x0, y0), sample(x0 + 1, y0), sample(x0, y0 + 1), sample(x0 + 1, y0 + 1)];
  const valid = values.map((value, i) => Number.isFinite(value) ? i : -1).filter(i => i >= 0);
  if (!valid.length) return null;
  if (valid.length < 4) return values[valid[0]];
  return (values[0] * (1 - fx) + values[1] * fx) * (1 - fy) +
    (values[2] * (1 - fx) + values[3] * fx) * fy;
}
