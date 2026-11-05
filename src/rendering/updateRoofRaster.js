import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { roofSignatures } from '../globals/roofSignatures.js';

import { rebuildRoofAtlas } from './rebuildRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

export function updateRoofRaster(backend, now) {
  const map = backend._map;
  const rasters = sceneByLayer.get(backend)._roofRasters ||= /* alloc */ [];
  rasters.length = 0;
  let hasRoofTexture = false;
  let layer;
  for (layer of sceneByLayer.get(backend)._layers) {
    if (layer.options.roofTexture) { hasRoofTexture = true; break; }
  }
  if (hasRoofTexture) {
    for (layer of Object.values(map._layers)) {
      if (sceneByLayer.get(layer)._type === 'pmtiles' && sceneByLayer.get(layer)._rasterTiles && layer.options.opacity > 0) rasters.push(layer);
    }
    const signatures = roofSignatures;
    signatures.length = 0;
    let loading = false;
    for (layer of rasters) {
      signatures.push(`${L.Util.stamp(layer)}:${sceneByLayer.get(layer)._rasterVersion || 0}:${layer.options.opacity}:${layer.options.zIndex}`);
      loading ||= Boolean(sceneByLayer.get(layer)._loadingTiles);
    }
    const signature = signatures.join('|');
    signatures.length = 0;
    if (!sceneByLayer.get(backend)._roofRaster || sceneByLayer.get(backend)._roofRaster.signature !== signature &&
      (!loading || now - sceneByLayer.get(backend)._roofRaster.updatedAt >= 50)) {
      rebuildRoofAtlas(backend, rasters, signature, now);
    }
  } else if (sceneByLayer.get(backend)._roofRaster) {
    destroyTexture(backend, sceneByLayer.get(backend)._roofRaster.texture.texture);
    sceneByLayer.get(backend)._roofRaster = null;
  }
  return rasters;
}
