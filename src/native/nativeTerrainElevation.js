import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

export function nativeTerrainElevation(state, point, x, y, z) {
  let layer, native, request, elevation;
  const key = `${x}:${y}:${z}`;
  for (layer of Object.values(state.map._layers)) {
    native = nativeGPUByLayer.get(layer);
    if (native?.disposed || native?.terrainStream !== state) continue;
    request = native.terrainRequests?.get(key);
    if (!request?.tiles || layer._tiles[key] !== request.tile) continue;
    elevation = terrainElevation(point, request.tiles);
    if (Number.isFinite(elevation)) return elevation;
  }
  return null;
}
