import { L } from '../globals/L.js';

/**
 * Create a rotate control.
 *
 * @param {Object} options Control options.
 *
 * @returns {L.Control.Rotate} New control.
 */
export function rotateControl(options) {
  return /* alloc */ new L.Control.Rotate(options);
}
