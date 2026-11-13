import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { onRemove3DLayer } from './onRemove3DLayer.js';
import { onPMTileRemove } from '../raster/onPMTileRemove.js';
import { onTerrainRemove } from '../terrain/onTerrainRemove.js';
import { removeTimeLayer } from '../sunlight/removeTimeLayer.js';

/**
 * Dispatch layer removal according to its registered scene kind.
 *
 * @param {L.Layer} layer Layer being removed.
 * @param {L.Map} map Map containing the layer.
 *
 * @returns {*} Result of the selected remove handler, if any.
 */
export function removeSceneLayer(layer, map) {
  switch (kindByLayer.get(layer)) {
    case '3d': return onRemove3DLayer(layer, map);
    case 'raster': return onPMTileRemove(layer, map);
    case 'terrain': return onTerrainRemove(layer, map);
    case 'time': return removeTimeLayer.call(layer, map);
  }
}
