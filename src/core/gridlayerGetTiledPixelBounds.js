import { L } from '../globals/L.js';
import { tiledBounds } from '../globals/tiledBounds.js';

import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { renderers } from '../weakmaps/renderers.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { mapMethods } from '../globals/mapMethods.js';
import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';
import { groundBounds } from '../projections/groundBounds.js';
import { animationPoint } from '../projections/transformZoomAnimationPoint.js';

export function gridlayerGetTiledPixelBounds(center) {
  const map = this._map, stream = streamTerrainByMap.get(map);
  if (!stream && !mapGetBearing(map) && !mapGetPitch(map)) return tiledBounds.value.call(this, center);
  const bounds = map.getBounds();
  const result = /* alloc */ new L.Bounds(map.project(bounds.getNorthWest(), this._tileZoom),
    map.project(bounds.getSouthEast(), this._tileZoom));
  const shared = renderers.get(map), origin = shared && sceneOriginByLayer.get(shared);
  if (!stream || !origin) return result;
  let minimum = Infinity, maximum = -Infinity, key, entry;
  for ([key, entry] of stream.terrainCache) {
    if (!key.startsWith(`${this._tileZoom}/`) || !entry.range) continue;
    minimum = Math.min(minimum, entry.range[0]);
    maximum = Math.max(maximum, entry.range[1]);
  }
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return result;
  const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
  const scale = map.options.crs.scale(zoom) / (earthCirc * Math.cos(origin.lat * radians));
  const target = mapElevationOf(map, map.getCenter()) ?? 0;
  let i, j, footprint, point, raw;
  for (i = 0; i < 2; i++) {
    footprint = groundBounds(map, undefined, ((i ? maximum : minimum) - target) * scale);
    for (j = 0; j < 2; j++) {
      point = j ? footprint.max : footprint.min;
      raw = mapMethods.value.containerPointToLayerPoint.call(map, animationPoint(map, point, true));
      result.extend(map.project(map.layerPointToLatLng(raw), this._tileZoom));
    }
  }
  return result;
}
