import { quadNativeMesh } from './quadNativeMesh.js';
import { boundsQuad } from '../geometry/boundsQuad.js';

/**
 * Synchronize a loaded image overlay as a textured quad.
 *
 * @param {Object} state Native layer state.
 */
export function syncImageOverlay(state) {
  const { source } = state;
  if (source._image?.complete && source._image.naturalWidth) {
    quadNativeMesh(state, 'image', source._image, boundsQuad(state, source.getBounds()), source.options.opacity ?? 1);
  }
}
