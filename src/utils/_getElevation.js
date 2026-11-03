import { bridgeElevation } from './bridgeElevation.js';
import { terrainElevation } from './terrainElevation.js';

/** @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom. */
export function _getElevation(backend, location) {
  if (!backend._map || !backend._terrainReady) return null;
  const point = location instanceof L.Point ? location : backend._map.project(location, backend._terrainZoom);
  return bridgeElevation(point, backend._bridges) ?? terrainElevation(point, backend._terrainTiles);
}
