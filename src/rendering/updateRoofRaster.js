import { sceneByLayer } from '../globals/sceneByLayer.js';

import { updateRoofAtlas } from './updateRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

export function updateRoofRaster(backend, now) {
  const map = backend._map;
  const rasters = sceneByLayer.get(backend)._roofRasters ||= /* alloc */ [];
  rasters.length = 0;
  let hasRoofTexture = false;
  let layer;
  for (layer of sceneByLayer.get(backend)._layers) {
    if (layer.options.roofTexture || layer.options.wallTexture) { hasRoofTexture = true; break; }
  }
  if (hasRoofTexture) {
    for (layer of Object.values(map._layers)) {
      if (sceneByLayer.get(layer).kind === 'raster' && sceneByLayer.get(layer)._rasterTiles && layer.options.opacity > 0) rasters.push(layer);
    }
    updateRoofAtlas(backend, rasters, now);
  } else if (sceneByLayer.get(backend)._roofRaster) {
    destroyTexture(backend, sceneByLayer.get(backend)._roofRaster.texture.texture);
    sceneByLayer.get(backend)._roofRaster = null;
  }
  return rasters;
}
