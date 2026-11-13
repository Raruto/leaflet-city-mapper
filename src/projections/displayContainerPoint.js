import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';
import { renderers } from '../weakmaps/renderers.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { mapMethods } from '../globals/mapMethods.js';
import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';
import { animationPoint } from './transformZoomAnimationPoint.js';
import { project } from './projectCameraPoint.js';

/**
 * Convert a layer point to container coordinates, accounting for terrain elevation and camera animation.
 *
 * @param {L.Map} map Map containing the point.
 * @param {L.Point} point Layer point to project.
 * @param {L.LatLng} [location] Geographic position used to sample elevation.
 *
 * @returns {L.Point} Display position relative to the map pane.
 */
export function displayPoint(map, point, location) {
  const shared = renderers.get(map), origin = shared && sceneOriginByLayer.get(shared);
  if (!streamTerrainByMap.get(map) || !origin) {
    return map.layerPointToContainerPoint(point).subtract(map._getMapPanePos());
  }
  const elevation = mapElevationOf(map, location || map.layerPointToLatLng(point)) ?? 0;
  const center = mapElevationOf(map, map.getCenter()) ?? 0;
  const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
  const height = (elevation - center) * map.options.crs.scale(zoom) / (earthCirc * Math.cos(origin.lat * radians));
  const raw = animationPoint(map, mapMethods.value.layerPointToContainerPoint.call(map, point));
  return project(map, raw, false, false, height).subtract(map._getMapPanePos());
}
