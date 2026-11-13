import { styleNativeMesh } from './styleNativeMesh.js';
import { parseColor } from '../colors/parseColor.js';

/**
 * Rescale a native stroke for the current zoom and refresh stroke and fill styles.
 *
 * @param {Object} state Native vector layer state.
 */
export function syncNativeStrokeZoom(state) {
  const { source, meshes, strokeCoordinates, strokeAnchors } = state;
  const mesh = meshes.get('stroke');
  let i, r, g, b, fill;
  if (mesh) {
    const factor = 2 ** (state.strokeZoom - state.map.getZoom()) *
      Number(source.options.weight) / state.strokeWeight;
    const attribute = mesh.geometry.attributes.position;
    if (mesh.program.uniforms.strokeScale) {
      mesh.program.uniforms.strokeScale.value = factor;
    } else {
      for (i = 0; i < strokeCoordinates.length; i++) {
        attribute.data[i] = strokeAnchors[i] + (strokeCoordinates[i] - strokeAnchors[i]) * factor;
      }
      attribute.needsUpdate = true;
      mesh.geometry.bounds = null;
    }
    ({ r, g, b } = parseColor(source.options.color));
    styleNativeMesh(state, mesh, /* alloc */ [r, g, b], source.options.opacity ?? 1);
  }
  fill = meshes.get('fill');
  if (fill) {
    ({ r, g, b } = parseColor(source.options.fillColor || source.options.color));
    styleNativeMesh(state, fill, /* alloc */ [r, g, b], source.options.fillOpacity ?? 1);
  }
}
