import { bridgesByLayer } from '../weakmaps/bridgesByLayer.js';
import { terrainReadyByLayer } from '../weakmaps/terrainReadyByLayer.js';
import { terrainTilesByLayer } from '../weakmaps/terrainTilesByLayer.js';
import { terrainZoomByLayer } from '../weakmaps/terrainZoomByLayer.js';
import { L } from '../globals/L.js';
import { bridgeElevation } from '../geometry/bridgeElevation.js';
import { terrainElevation } from './terrainElevation.js';

/**
 * Sample bridge or DEM elevation when the terrain layer is ready.
 *
 * @param {L.Layer} layer Terrain layer.
 * @param {L.LatLng|L.Point} location LatLng, or a pixel point at the terrain zoom.
 *
 * @returns {number|null} Elevation in metres, or null when unavailable.
 */
export function getElevation(layer, location) {
  if (!layer._map || !terrainReadyByLayer.get(layer)) return null;
  const point = location instanceof L.Point ? location : layer._map.project(location, terrainZoomByLayer.get(layer));
  return bridgeElevation(point, bridgesByLayer.get(layer)) ?? terrainElevation(point, terrainTilesByLayer.get(layer));
}
