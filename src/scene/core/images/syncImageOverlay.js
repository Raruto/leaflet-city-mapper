import { quadNativeMesh } from '../meshes/quadNativeMesh.js';
import { boundsQuad } from '../meshes/boundsQuad.js';

export function syncImageOverlay(state) {
  const { source } = state;
  if (source._image?.complete && source._image.naturalWidth) {
    quadNativeMesh(state, 'image', source._image, boundsQuad(state, source.getBounds()), source.options.opacity ?? 1);
  }
}
