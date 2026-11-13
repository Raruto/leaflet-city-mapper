import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './buildCarriage.js';

/**
 * Build a single bus carriage colored from its route properties.
 *
 * @param {number} index Vehicle index, unused by this model.
 * @param {Object} properties Route properties used to choose the color.
 *
 * @returns {Array} Bus extrusion parts.
 */
export function busModel(index, properties) {
  return carriage(0, 12, routeColor(properties));
}
