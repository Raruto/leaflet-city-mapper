import { quadNativeMesh } from './quadNativeMesh.js';
import { markerQuadCorners } from './markerQuadCorners.js';

export function syncMarker(state) {
  const { source } = state;
  let i, key, image, mesh;
  for (i = 0; i < 2; i++) {
    key = i ? 'icon' : 'shadow';
    image = i ? source._icon : source._shadow;
    if (!(image instanceof HTMLImageElement) || !image.complete || !image.naturalWidth) continue;
    mesh = quadNativeMesh(state, key, image, markerQuadCorners(state, key, image), source.options.opacity ?? 1);
    if (key === 'shadow' && mesh) mesh.renderOrder -= 100 * 1e6;
  }
}
