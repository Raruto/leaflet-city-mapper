import { quadNativeMesh } from './quadNativeMesh.js';
import { markerQuadCorners } from './markerQuadCorners.js';

export function syncMarker(state) {
  const { source } = state;
  for (const [key, image] of [['shadow', source._shadow], ['icon', source._icon]]) {
    if (!(image instanceof HTMLImageElement) || !image.complete || !image.naturalWidth) continue;
    const mesh = quadNativeMesh(state, key, image, markerQuadCorners(state, key, image), source.options.opacity ?? 1);
    if (key === 'shadow' && mesh) mesh.renderOrder -= 100 * 1e6;
  }
}
