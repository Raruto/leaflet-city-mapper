import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';


import { radians } from '../globals/radians.js';
import { cameraFov } from '../globals/cameraFov.js';
import { earthCirc } from '../globals/earthCirc.js';
import { mapElevationOf } from '../terrain/mapElevationOf.js';
import { mapMethods } from '../globals/mapMethods.js';
import { walkByMap } from '../weakmaps/walkByMap.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { updateCamera } from "./updateSceneCamera.js";

import { animationPoint } from '../projections/transformZoomAnimationPoint.js';

export function updateMapCamera(layer, size) {
  const map = layer._map;
  // Match the map's perspective, including the intermediate view of an animated zoom.
  const zoom = cameraViewByMap.get(map)?.zoom ?? map.getZoom();
  const pixelsPerMeter = map.options.crs.scale(zoom) /
    (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
  const origin = animationPoint(map, mapMethods.value.layerPointToContainerPoint.call(map,
    map.project(sceneOriginByLayer.get(layer)).subtract(map.getPixelOrigin())));
  const distance = size.y * 1.5 / pixelsPerMeter;
  const targetX = (size.x / 2 - origin.x) / pixelsPerMeter;
  // CSS zoom keeps the logical view's ground plane until zoomend.
  const walker = walkByMap.get(map)?.control?._walk;
  const targetY = (mapElevationOf(map, map.getCenter()) ?? 0) +
    (walker?.saved ? walker.state.height : 0);
  const targetZ = (size.y / 2 - origin.y) / pixelsPerMeter;
  const pitch = mapGetPitch(map) * radians;
  const bearing = mapGetBearing(map) * radians;
  const camera = cameraByLayer.get(layer);
  camera.fov = cameraFov;
  camera.aspect = size.x / size.y;
  camera.near = Math.max(0.1, distance / 10000);
  camera.far = Math.max(10000, distance * 10);
  camera.position[0] = targetX + Math.sin(bearing) * Math.sin(pitch) * distance;
  camera.position[1] = targetY + Math.cos(pitch) * distance;
  camera.position[2] = targetZ + Math.cos(bearing) * Math.sin(pitch) * distance;
  camera.up[0] = -Math.sin(bearing) * Math.cos(pitch);
  camera.up[1] = Math.sin(pitch);
  camera.up[2] = -Math.cos(bearing) * Math.cos(pitch);
  camera.target[0] = targetX; camera.target[1] = targetY; camera.target[2] = targetZ;
  // Refresh the camera view, projection and combined projection-view matrices.
  updateCamera(camera);
}
