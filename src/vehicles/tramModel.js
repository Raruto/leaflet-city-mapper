import { routeColor } from '../traffic/routeColor.js';
import { carriage } from './buildCarriage.js';

/**
 * Build a five-car tram colored from its route properties.
 *
 * @param {number} index Vehicle index, unused by this model.
 * @param {Object} properties Route properties used to choose the color.
 *
 * @returns {Array} Tram extrusion parts.
 */
export function tramModel(index, properties) {
  const color = routeColor(properties), parts = /* alloc */ [];
  let car;
  for (car = 0; car < 5; car++) parts.push(...carriage((car - 2) * 6.5, 6, color));
  return parts;
}
