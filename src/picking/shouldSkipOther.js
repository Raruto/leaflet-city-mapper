import { typeByLayer } from '../weakmaps/typeByLayer.js';

/**
 * Exclude the current layer, terrain and traffic from other-layer picking.
 *
 * @param {L.Layer} other Candidate layer.
 * @param {L.Layer} layer Current layer.
 *
 * @returns {boolean} Whether the candidate should be skipped.
 */
export function shouldSkipOther(other, layer) {
  return other === layer || typeByLayer.get(other) === 'terrain' || typeByLayer.get(other) === 'traffic';
}
