import { pluginState } from '../core/pluginState.js';
import { rebuildRoofAtlas } from './rebuildRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

export function updateRoofRaster(backend, now) {
  const map = backend._map;
  const rasters = pluginState(backend)._roofRasters ||= /* allocation: required -- Each backend retains its own frame's raster list through mesh preparation. */ [];
  rasters.length = 0;
  let hasRoofTexture = false;
  let layer;
  for (layer of pluginState(backend)._layers) {
    if (layer.options.roofTexture) { hasRoofTexture = true; break; }
  }
  if (hasRoofTexture) {
    for (layer of Object.values(map._layers)) {
      if (pluginState(layer)._type === 'pmtiles' && pluginState(layer)._rasterTiles && layer.options.opacity > 0) rasters.push(layer);
    }
    const signatures = sharedState.allocationRenderRoofSignatures;
    signatures.length = 0;
    let loading = false;
    for (layer of rasters) {
      signatures.push(`${L.Util.stamp(layer)}:${pluginState(layer)._rasterVersion || 0}:${layer.options.opacity}:${layer.options.zIndex}`);
      loading ||= Boolean(pluginState(layer)._loadingTiles);
    }
    const signature = signatures.join('|');
    signatures.length = 0;
    if (!pluginState(backend)._roofRaster || pluginState(backend)._roofRaster.signature !== signature &&
      (!loading || now - pluginState(backend)._roofRaster.updatedAt >= 50)) {
      rebuildRoofAtlas(backend, rasters, signature, now);
    }
  } else if (pluginState(backend)._roofRaster) {
    destroyTexture(backend, pluginState(backend)._roofRaster.texture.texture);
    pluginState(backend)._roofRaster = null;
  }
  return rasters;
}
import { state as sharedState } from '../state.js';
