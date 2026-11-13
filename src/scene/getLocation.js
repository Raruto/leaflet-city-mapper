import { locationByLayer } from '../weakmaps/locationByLayer.js';

/**
 * Read the geographic origin stored for a layer.
 *
 * @param {L.Layer} layer Layer to inspect.
 *
 * @returns {L.LatLng|undefined} Stored origin, if initialized.
 */
export function getLocation(layer) {
  return locationByLayer.get(layer);
}
