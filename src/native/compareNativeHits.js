/**
 * Sort native hits by descending render order and then ascending distance.
 *
 * @param {Object} a First hit.
 * @param {Object} b Second hit.
 *
 * @returns {number} Relative order of the hits.
 */
export function compareNativeHits(a, b) {
  return b.object.renderOrder - a.object.renderOrder || a.distance - b.distance;
}
