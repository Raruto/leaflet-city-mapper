import { radians } from '../globals/radians.js';
import { cameraFov } from '../globals/cameraFov.js';
import { earthCirc } from '../globals/earthCirc.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { mapMethods } from '../globals/mapMethods.js';
import { walkByMap } from '../globals/walkByMap.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

import { updateCamera } from "../scene/updateCamera.js";
import { getElevation } from "../terrain/getElevation.js";

import { animationPoint } from '../camera/animationPoint.js';

export function updateMapCamera(backend, size) {
  const map = backend._map;
  // Match the map's perspective, including the intermediate view of an animated zoom.
  const zoom = cameraByMap.get(map)._cameraView?.zoom ?? map.getZoom();
  const pixelsPerMeter = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneByLayer.get(backend)._sceneOrigin.lat * radians));
  const origin = animationPoint(map, mapMethods.value.layerPointToContainerPoint.call(map,
    map.project(sceneByLayer.get(backend)._sceneOrigin).subtract(map.getPixelOrigin())));
  const distance = size.y * 1.5 / pixelsPerMeter;
  const targetX = (size.x / 2 - origin.x) / pixelsPerMeter;
  // CSS zoom keeps the logical view's ground plane until zoomend.
  const walker = walkByMap.get(map)?.control?._walk;
  const targetY = ((cameraByMap.get(map)._terrain3D ? getElevation(cameraByMap.get(map)._terrain3D, map.getCenter()): undefined) ?? 0) +
    (walker?.saved ? walker.state.height : 0);
  const targetZ = (size.y / 2 - origin.y) / pixelsPerMeter;
  const pitch = mapGetPitch(map) * radians;
  const bearing = mapGetBearing(map) * radians;
  const camera = sceneByLayer.get(backend).camera;
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
