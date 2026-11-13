import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';

/**
 * Create a Leaflet layer with the given options.
 *
 * @param {Object} [options] Layer options.
 *
 * @returns {L.Layer} New layer.
 */
export function createLayer(options = sceneEmptyOptions) {
  return /* alloc */ new L.Layer(options);
}
