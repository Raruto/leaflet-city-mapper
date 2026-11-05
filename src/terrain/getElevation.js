import { pluginState } from '../core/pluginState.js';
import { bridgeElevation } from '../geometry/bridgeElevation.js';
import { terrainElevation } from './terrainElevation.js';

/** @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom. */

export function getElevation(backend, location) {
  if (!backend._map || !pluginState(backend)._terrainReady) return null;
  const point = location instanceof L.Point ? location : backend._map.project(location, pluginState(backend)._terrainZoom);
  return bridgeElevation(point, pluginState(backend)._bridges) ?? terrainElevation(point, pluginState(backend)._terrainTiles);
}
