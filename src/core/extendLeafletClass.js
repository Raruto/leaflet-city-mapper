import { L } from '../globals/L.js';

/**
 * Obtain a compatible Leaflet class, extending it on Leaflet 1.
 *
 * @param {Function} parent Parent Leaflet class.
 *
 * @returns {Function} Parent or extended class.
 */
export function extendLeafletClass(parent) {
  return L.version.startsWith('2.') ? parent : parent.extend(/* alloc */ {});
}
