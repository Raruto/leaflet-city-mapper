import { cameraZIndexOffsetByLayer } from '../weakmaps/cameraZIndexOffsetByLayer.js';
import { L } from '../globals/L.js';

/**
 * Apply color, opacity, ordering and source metadata to a native mesh.
 *
 * @param {Object} state Native layer state.
 * @param {Object} mesh Mesh to update.
 * @param {number|Array} color Material color.
 * @param {number} opacity Material opacity.
 */
export function styleNativeMesh(state, mesh, color, opacity) {
  const { source, marker, paneOrder, order } = state;
  mesh.program.uniforms.baseColor.value = color;
  mesh.program.uniforms.opacity.value = opacity;
  if (source instanceof L.GridLayer) mesh.opacity = opacity;
  const zIndex = marker ? source._zIndex + (cameraZIndexOffsetByLayer.get(source) || 0) : source.options.zIndex;
  mesh.renderOrder = paneOrder * 1e6 + (zIndex || 0) * 1000 + order;
  mesh._nativeSource = source;
  mesh._nativeUsed = true;
}
