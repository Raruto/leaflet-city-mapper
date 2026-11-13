import { reportError } from '../scene/reportLayerError.js';

/**
 * Report a rendered vector batch error on its owning layer.
 *
 * @param {Object} event Error event.
 */
export function forwardVectorTileError({ error }) {
  reportError(this, error);
}
