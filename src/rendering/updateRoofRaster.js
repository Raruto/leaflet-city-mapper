import { rebuildRoofAtlas } from './rebuildRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

export function updateRoofRaster(backend, now) {
  const map = backend._map;
  const rasters = [];
  let hasRoofTexture = false;
  let layer;
  for (layer of backend._layers) {
    if (layer.options.roofTexture) { hasRoofTexture = true; break; }
  }
  if (hasRoofTexture) {
    for (layer of Object.values(map._layers)) {
      if (layer._type === 'pmtiles' && layer._rasterTiles && layer.options.opacity > 0) rasters.push(layer);
    }
    const signatures = [];
    let loading = false;
    for (layer of rasters) {
      signatures.push(`${L.Util.stamp(layer)}:${layer._rasterVersion || 0}:${layer.options.opacity}:${layer.options.zIndex}`);
      loading ||= Boolean(layer._loadingTiles);
    }
    const signature = signatures.join('|');
    if (!backend._roofRaster || backend._roofRaster.signature !== signature &&
      (!loading || now - backend._roofRaster.updatedAt >= 50)) {
      rebuildRoofAtlas(backend, rasters, signature, now);
    }
  } else if (backend._roofRaster) {
    destroyTexture(backend, backend._roofRaster.texture.texture);
    backend._roofRaster = null;
  }
  return rasters;
}
