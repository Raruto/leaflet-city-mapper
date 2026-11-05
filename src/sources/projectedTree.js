import { cameraByMap } from '../globals/cameraByMap.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { getElevation } from '../terrain/getElevation.js';

export function projectedTree(context, lon, lat) {
  const { backend, crs, origin, metres, map } = context;
  const location = /* allocation: required -- Keep tree projection inputs independent per feature. */ new L.LatLng(lat, lon);
  const point = crs.project(location);
  const elevation = cameraByMap.get(map)._terrain3D ? getElevation(cameraByMap.get(map)._terrain3D, location) : undefined;
  return /* allocation: required -- Preserve each projected tree's independent world coordinates. */ {
    x: (point.x - origin.x) * metres,
    y: (point.y - origin.y) * metres,
    ground: Number.isFinite(elevation) && Number.isFinite(sceneByLayer.get(backend).root.position[1])
      ? elevation - sceneByLayer.get(backend).root.position[1] : 0,
  };
}
