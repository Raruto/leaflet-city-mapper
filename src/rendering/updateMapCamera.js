import { updateCamera } from "../scene/updateCamera.js";
import { getElevation } from "../terrain/getElevation.js";

export function updateMapCamera(backend, size) {
  const map = backend._map;
  // Match the map's perspective, including the intermediate view of an animated zoom.
  const zoom = map._cameraView?.zoom ?? map.getZoom(), center = map._cameraView?.center ?? map.getCenter();
  const pixelsPerMeter = map.options.crs.scale(zoom) / (40075016.68557849 * Math.cos(backend._sceneOrigin.lat * Math.PI / 180));
  const offset = map.project(center, zoom).subtract(map.project(backend._sceneOrigin, zoom));
  const distance = size.y * 1.5 / pixelsPerMeter;
  const target = [
    offset.x / pixelsPerMeter,
    (map._terrain3D ? getElevation(map._terrain3D, center): undefined) ?? 0,
    offset.y / pixelsPerMeter
  ];
  const pitch = map.getPitch() * Math.PI / 180;
  const bearing = map.getBearing() * Math.PI / 180;
  const camera = backend.camera;
  camera.fov = 2 * Math.atan(1 / 3) * 180 / Math.PI;
  camera.aspect = size.x / size.y;
  camera.near = Math.max(0.1, distance / 10000);
  camera.far = Math.max(10000, distance * 10);
  camera.position[0] = target[0] + Math.sin(bearing) * Math.sin(pitch) * distance;
  camera.position[1] = target[1] + Math.cos(pitch) * distance;
  camera.position[2] = target[2] + Math.cos(bearing) * Math.sin(pitch) * distance;
  camera.up[0] = -Math.sin(bearing) * Math.cos(pitch);
  camera.up[1] = Math.sin(pitch);
  camera.up[2] = -Math.cos(bearing) * Math.cos(pitch);
  camera.target[0] = target[0]; camera.target[1] = target[1]; camera.target[2] = target[2];
  // Refresh the camera view, projection and combined projection-view matrices.
  updateCamera(camera);
}
