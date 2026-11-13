import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { onAdd3DLayer } from './onAdd3DLayer.js';
import { onPMTileAdd } from '../raster/onPMTileAdd.js';
import { onTerrainAdd } from '../terrain/onTerrainAdd.js';
import { addRasterImage } from '../textures/attachRasterImage.js';
import { addTimeLayer } from '../sunlight/addTimeLayer.js';

/**
 * Dispatch layer attachment according to its registered scene kind.
 *
 * @param {L.Layer} layer Layer being added.
 * @param {L.Map} map Map receiving the layer.
 *
 * @returns {*} Result of the selected add handler, if any.
 */
export function addSceneLayer(layer, map) {
  switch (kindByLayer.get(layer)) {
    case '3d': return onAdd3DLayer(layer, map);
    case 'raster': return onPMTileAdd(layer, map);
    case 'terrain': return onTerrainAdd(layer, map);
    case 'image': return addRasterImage.call(layer, map);
    case 'time': return addTimeLayer.call(layer, map);
  }
}
