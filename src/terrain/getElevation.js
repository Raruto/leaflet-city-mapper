import { sceneByLayer } from '../globals/sceneByLayer.js';


import { bridgeElevation } from '../geometry/bridgeElevation.js';
import { terrainElevation } from './terrainElevation.js';

/** @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom. */

export function getElevation(backend, location) {
  if (!backend._map || !sceneByLayer.get(backend)._terrainReady) return null;
  const point = location instanceof L.Point ? location : backend._map.project(location, sceneByLayer.get(backend)._terrainZoom);
  return bridgeElevation(point, sceneByLayer.get(backend)._bridges) ?? terrainElevation(point, sceneByLayer.get(backend)._terrainTiles);
}
