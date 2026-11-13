import { L } from '../globals/L.js';
import { tiledBounds } from '../globals/tiledBounds.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { renderers } from '../weakmaps/renderers.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { extendTerrainPixelBounds } from './extendTerrainPixelBounds.js';

/**
 * Compute this grid layer's tile bounds for the camera and visible terrain.
 *
 * @param {L.LatLng} center Proposed map center for Leaflet's default calculation.
 *
 * @returns {L.Bounds} Projected tile pixel bounds.
 */
export function gridlayerGetTiledPixelBounds(center) {
  const map = this._map, stream = streamTerrainByMap.get(map);
  if (!stream && !mapGetBearing(map) && !mapGetPitch(map)) return tiledBounds.value.call(this, center);
  const bounds = map.getBounds();
  const result = /* alloc */ new L.Bounds(map.project(bounds.getNorthWest(), this._tileZoom),
    map.project(bounds.getSouthEast(), this._tileZoom));
  const shared = renderers.get(map), origin = shared && sceneOriginByLayer.get(shared);
  if (!stream || !origin) return result;
  return extendTerrainPixelBounds(this, result, stream, origin);
}
