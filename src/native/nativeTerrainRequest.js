import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

/**
 * Find the finest rendered terrain tile covering a geographic location.
 *
 * @param {Object} state Terrain stream state.
 * @param {L.LatLng} location Geographic location to sample.
 *
 * @returns {Object|undefined} Rendered tile request, if one covers the location.
 */
export function nativeTerrainRequest(state, location) {
  let layer, native, mesh, request, coords, point, selected, projectedZoom;
  let zoom = -1;
  for (layer of Object.values(state.map._layers)) {
    native = nativeGPUByLayer.get(layer);
    if (native?.disposed || native?.terrainStream !== state) continue;
    for (mesh of native.meshes.values()) {
      request = mesh._terrainRequest;
      if (!request?.tiles || request.tile.coords.z <= zoom) continue;
      coords = request.tile.coords;
      if (projectedZoom !== coords.z) {
        point = state.map.project(location, coords.z);
        projectedZoom = coords.z;
      }
      if (point.x < coords.x * 256 || point.x > (coords.x + 1) * 256 ||
          point.y < coords.y * 256 || point.y > (coords.y + 1) * 256) continue;
      selected = request;
      zoom = coords.z;
    }
  }
  return selected;
}
