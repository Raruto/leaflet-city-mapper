/**
 * Check that the vector tile session is current and the map has settled.
 *
 * @param {Object} layer Vector tile layer.
 * @param {Object} session Session identity.
 *
 * @returns {boolean} Whether the session is idle.
 */
export function vectorTilesIdle(layer, session) {
  return layer.session === session && performance.now() - (layer.changedAt || 0) >= 180;
}
