import { nativeLayerState } from '../constants/nativeLayerState.js';
import { nativeGeometry } from '../../../geometry/leaflet-core/nativeGeometry.js';
import { localPixelForGeometry } from '../meshes/localPixelForGeometry.js';
import { parseColor } from '../../../utils/parseColor.js';
import { putNativeMesh } from '../meshes/putNativeMesh.js';

export function syncVectorLayer(state) {
  const { source } = state;
  nativeLayerState.geometryPixelStates.push(state);
  let geometry;
  try {
    geometry = nativeGeometry(source, state.map, localPixelForGeometry);
  } finally {
    nativeLayerState.geometryPixelStates.pop();
  }
  const { fill, stroke } = geometry;
  for (const [key, positions, color, opacity] of [
    ['fill', fill, source.options.fillColor || source.options.color, source.options.fillOpacity],
    ['stroke', stroke, source.options.color, source.options.opacity],
  ]) {
    if (!positions.length) continue;
    const { r, g, b } = parseColor(color);
    putNativeMesh(state, key, positions, [r, g, b], opacity ?? 1);
  }
}
