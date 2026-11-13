import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './buildCarriage.js';

/**
 * Build a five-car metro colored from its route properties.
 *
 * @param {number} index Vehicle index, unused by this model.
 * @param {Object} properties Route properties used to choose the color.
 *
 * @returns {Array} Metro extrusion parts.
 */
export function metroModel(index, properties) {
  const color = routeColor(properties), parts = /* alloc */ [];
  let car;
  for (car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 15, 14, color));
  return parts;
}
