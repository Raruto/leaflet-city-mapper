export function sample(tiles, px, py) {
  const tileX = Math.floor(px / 256), tileY = Math.floor(py / 256);
  const tile = tiles.get(`${tileX}/${tileY}`);
  if (!tile) return null;
  const elevation = tile[(py - tileY * 256) * 256 + px - tileX * 256];
  return Number.isFinite(elevation) && elevation > -1000 ? elevation : null;
}
