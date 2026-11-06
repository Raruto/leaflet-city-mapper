import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { roofSignatures } from '../globals/roofSignatures.js';
import { rebuildRoofAtlas } from './rebuildRoofAtlas.js';

export function updateRoofAtlas(backend, rasters, now) {
  const signatures = roofSignatures;
  signatures.length = 0;
  let loading = false, layer;
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
}
