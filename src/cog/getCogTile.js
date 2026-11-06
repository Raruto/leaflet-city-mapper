import { getElevationTile } from './getElevationTile.js';
import { getColorTile } from './getColorTile.js';
import { validCogTileCoordinates } from './validCogTileCoordinates.js';

export async function getCogTile(source, z, x, y, signal) {
  signal?.throwIfAborted();
  if (!validCogTileCoordinates(z, x, y)) throw /* alloc */ new Error('Invalid COG tile coordinates');
  const level = source.levels.get(z);
  if (!level || x + 1 <= level.x || y + 1 <= level.y || x >= level.x + level.columns || y >= level.y + level.rows) return;
  if (level.elevation) return getElevationTile(source, level, x, y, signal);
  return getColorTile(source, level, x, y, signal);
}
