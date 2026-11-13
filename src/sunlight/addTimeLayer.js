import { controlByLayer } from '../weakmaps/controlByLayer.js';

/**
 * Add the control associated with this time layer to a map.
 *
 * @param {L.Map} map Map receiving the control.
 *
 * @returns {L.Control} The associated time control.
 */
export function addTimeLayer(map) {
  return controlByLayer.get(this).addTo(map);
}
