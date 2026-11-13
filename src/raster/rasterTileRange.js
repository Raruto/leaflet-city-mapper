import { TILE_SIZE } from '../globals/TILE_SIZE.js';
import { TILE_RADIUS } from '../globals/TILE_RADIUS.js';
import { archiveNorthWest } from '../globals/archiveNorthWest.js';
import { archiveSouthEast } from '../globals/archiveSouthEast.js';

/**
 * Compute the visible tile range, clipped to archive bounds and the center tile radius.
 *
 * @param {L.Map} map Map providing the view bounds and projection.
 * @param {Object} header Archive header with optional geographic bounds.
 * @param {number} zoom Tile zoom level.
 *
 * @returns {Object} Inclusive minimum and maximum tile coordinates.
 */
export function rasterTileRange(map, header, zoom) {
  const bounds = map.getBounds();
  const northwest = map.project(bounds.getNorthWest(), zoom).divideBy(TILE_SIZE).floor();
  const southeast = map.project(bounds.getSouthEast(), zoom).divideBy(TILE_SIZE).floor();
  archiveNorthWest[0] = header.maxLat; archiveNorthWest[1] = header.minLon;
  archiveSouthEast[0] = header.minLat; archiveSouthEast[1] = header.maxLon;
  const archiveMin = header.maxLat === undefined || header.minLon === undefined
    ? null : map.project(archiveNorthWest, zoom).divideBy(TILE_SIZE).floor();
  const archiveMax = header.minLat === undefined || header.maxLon === undefined
    ? null : map.project(archiveSouthEast, zoom).divideBy(TILE_SIZE).floor();
  const center = map.project(map.getCenter(), zoom).divideBy(TILE_SIZE).floor();
  return /* alloc */ {
    minX: Math.max(0, northwest.x, archiveMin?.x ?? 0, center.x - TILE_RADIUS),
    maxX: Math.min(2 ** zoom - 1, southeast.x, archiveMax?.x ?? 2 ** zoom - 1, center.x + TILE_RADIUS),
    minY: Math.max(0, northwest.y, archiveMin?.y ?? 0, center.y - TILE_RADIUS),
    maxY: Math.min(2 ** zoom - 1, southeast.y, archiveMax?.y ?? 2 ** zoom - 1, center.y + TILE_RADIUS),
  };
}
