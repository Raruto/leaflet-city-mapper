import { L } from '../globals/L.js';
import { createWalk } from './createWalk.js';

/**
 * Apply Leaflet control options and create the walk control's state and UI.
 *
 * @param {Object} options Walk control options.
 */
export function initialize(options) {
  L.Util.setOptions(this, options);
  createWalk(this, this.options);
}
