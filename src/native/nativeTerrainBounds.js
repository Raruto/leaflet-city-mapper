import { L } from '../globals/L.js';
import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';
import { streamTerrainByMap } from '../weakmaps/streamTerrainByMap.js';

/**
 * Bound path tessellation to rendered terrain and record its finest grid zoom.
 *
 * @param {Object} state Native path state.
 *
 * @returns {L.Bounds|null} Tile coverage in current zoom pixels, or null without coverage.
 */
export function nativeTerrainBounds(state) {
  state.terrainZoom = 0;
  if (!streamTerrainByMap.get(state.map)) return null;
  const bounds = /* alloc */ new L.Bounds();
  let layer, native, mesh, tile, scale;
  for (layer of Object.values(state.map._layers)) {
    native = nativeGPUByLayer.get(layer);
    if (!native?.terrainStream || native.disposed) continue;
    for (mesh of native.meshes.values()) {
      tile = mesh._terrainRequest?.tile;
      if (!tile) continue;
      state.terrainZoom = Math.max(state.terrainZoom, tile.coords.z);
      scale = 2 ** (state.map.getZoom() - tile.coords.z);
      bounds.extend(/* alloc */ [tile.coords.x * 256 * scale, tile.coords.y * 256 * scale]);
      bounds.extend(/* alloc */ [(tile.coords.x + 1) * 256 * scale, (tile.coords.y + 1) * 256 * scale]);
    }
  }
  return bounds.isValid() ? bounds : null;
}
