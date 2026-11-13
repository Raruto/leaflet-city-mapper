import { terrainBoundsByLayer } from '../weakmaps/terrainBoundsByLayer.js';
import { terrainZoomByLayer } from '../weakmaps/terrainZoomByLayer.js';
import { L } from '../globals/L.js';
import { archiveNorthWest } from '../globals/archiveNorthWest.js';
import { archiveSouthEast } from '../globals/archiveSouthEast.js';
import { compareDistance } from '../utils/compareDistance.js';

/**
 * Build the archive terrain tile queue ordered by distance from the map center.
 *
 * @param {L.Layer} layer Terrain layer.
 * @param {Object} header Archive bounds and zoom metadata.
 *
 * @returns {Object[]} Tile coordinates with their distance from the center.
 */
export function terrainTileQueue(layer, header) {
  const map = layer._map
  terrainZoomByLayer.set(layer, header.maxZoom);
  archiveNorthWest[0] = header.maxLat; archiveNorthWest[1] = header.minLon;
  const northwest = map.project(archiveNorthWest, terrainZoomByLayer.get(layer)).divideBy(256).floor();
  archiveSouthEast[0] = header.minLat; archiveSouthEast[1] = header.maxLon;
  const southeast = map.project(archiveSouthEast, terrainZoomByLayer.get(layer)).divideBy(256).floor();
  terrainBoundsByLayer.set(layer, /* alloc */ new L.Bounds(northwest, southeast));
  const tiles = /* alloc */ [];
  const center = map.project(map.getCenter(), terrainZoomByLayer.get(layer)).divideBy(256);
  let x, y;
  for (x = northwest.x; x <= southeast.x; x++) {
    for (y = northwest.y; y <= southeast.y; y++) {
      tiles.push(/* alloc */ { z: terrainZoomByLayer.get(layer), x, y, distance: Math.hypot(x + 0.5 - center.x, y + 0.5 - center.y) });
    }
  }
  tiles.sort(compareDistance);
  return tiles;
}
