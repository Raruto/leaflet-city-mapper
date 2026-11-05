import { releaseRasterTile } from './releaseRasterTile.js';

export function pruneRasterTiles(backend) {
  const wanted = backend._wantedRasterTiles;
  const now = performance.now();
  if (backend._pruneVersion === backend._rasterVersion && backend._pruneWanted === wanted &&
    now < backend._pruneAfter) return Number.isFinite(backend._pruneAfter);
  backend._pruneVersion = backend._rasterVersion;
  backend._pruneWanted = wanted;
  backend._pruneAfter = Infinity;
  const pending = [];
  for (const key of wanted) {
    const tile = backend._rasterTiles.get(key);
    if (tile?.done && now - tile.loadedAt < 250) {
      backend._pruneAfter = Math.min(backend._pruneAfter, tile.loadedAt + 250);
    }
    if (!tile?.done || now - tile.loadedAt < 250) {
      const parts = key.split('/');
      pending.push({ z: Number(parts[0]), x: Number(parts[1]), y: Number(parts[2]) });
    }
  }
  for (const [key, tile] of backend._rasterTiles) {
    if (wanted.has(key)) continue;
    let overlaps = false;
    for (const coords of pending) {
      const zoom = Math.min(coords.z, tile.coords.z);
      if (Math.floor(coords.x / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.x / 2 ** (tile.coords.z - zoom)) &&
        Math.floor(coords.y / 2 ** (coords.z - zoom)) === Math.floor(tile.coords.y / 2 ** (tile.coords.z - zoom))) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) releaseRasterTile(backend, tile);
  }
  return Number.isFinite(backend._pruneAfter);
}
