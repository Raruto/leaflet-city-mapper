import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rasterTilesByLayer } from '../weakmaps/rasterTilesByLayer.js';
import { roofRasterByLayer } from '../weakmaps/roofRasterByLayer.js';
import { roofRastersByLayer } from '../weakmaps/roofRastersByLayer.js';
import { updateRoofAtlas } from './updateRoofAtlas.js';
import { destroyTexture } from './destroyTexture.js';

/**
 * Update or remove the roof atlas according to scene texture settings and active rasters.
 *
 * @param {L.Layer} layer Rendering layer.
 * @param {number} now Current frame time in milliseconds.
 *
 * @returns {Array<L.Layer>} Raster layers contributing to the roof atlas.
 */
export function updateRoofRaster(layer, now) {
  const map = layer._map;
  let rasters = roofRastersByLayer.get(layer);
  if (!rasters) roofRastersByLayer.set(layer, rasters = /* alloc */ []);
  rasters.length = 0;
  let hasRoofTexture = false;
  let sceneLayer, rasterLayer;
  for (sceneLayer of layersByLayer.get(layer)) {
    if (sceneLayer.options.roofTexture || sceneLayer.options.wallTexture) { hasRoofTexture = true; break; }
  }
  if (hasRoofTexture) {
    for (rasterLayer of Object.values(map._layers)) {
      if (kindByLayer.get(rasterLayer) === 'raster' && rasterTilesByLayer.get(rasterLayer) && rasterLayer.options.opacity > 0) rasters.push(rasterLayer);
    }
    updateRoofAtlas(layer, rasters, now);
  } else if (roofRasterByLayer.get(layer)) {
    destroyTexture(layer, roofRasterByLayer.get(layer).texture.texture);
    roofRasterByLayer.set(layer, null);
  }
  return rasters;
}
