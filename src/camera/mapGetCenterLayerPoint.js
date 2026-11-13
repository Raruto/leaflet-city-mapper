import { mapMethods } from '../globals/mapMethods.js';

/**
 * Convert the center of this map's container to a layer point.
 *
 * @returns {L.Point} Center layer point.
 */
export function mapGetCenterLayerPoint() {
  return mapMethods.value.containerPointToLayerPoint.call(this, this.getSize().divideBy(2));
}
