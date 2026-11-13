import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';

/**
 * Format a loading error or a count description for a layer-control status.
 *
 * @param {L.Layer} layer Layer whose status is described.
 * @param {string} formatted Formatted loaded count.
 * @param {number} pending Number of blocks still loading.
 * @param {Error|string} [error] Loading error, if any.
 *
 * @returns {string} Status title.
 */
export function layerCountTitle(layer, formatted, pending, error) {
  return error ? `Unable to load: ${typeof error === 'string' ? error : error.message}` :
    `${formatted} loaded ${modelUrlByLayer.get(layer) ? 'models' : 'elements'} in the current area${pending ? `; ${pending} blocks loading` : ''}`;
}
