import { parseColor } from '../colors/parseColor.js';
import { putNativeMesh } from './putNativeMesh.js';
import { syncNativeStrokeZoom } from './syncNativeStrokeZoom.js';
import { nativeVectorGeometry } from './nativeVectorGeometry.js';
import { syncNativeStrokeAnchors } from './syncNativeStrokeAnchors.js';

export function syncVectorLayer(state) {
  const { source } = state;
  if (state.zoomOnly) {
    syncNativeStrokeZoom(state);
    state.zoomOnly = false;
    return;
  }
  const { fill, stroke } = nativeVectorGeometry(state);
  syncNativeStrokeAnchors(state, stroke);
  let i, key, positions, color, opacity, r, g, b, attributes;
  for (i = 0; i < 2; i++) {
    key = i ? 'stroke' : 'fill';
    positions = i ? stroke : fill;
    color = i ? source.options.color : source.options.fillColor || source.options.color;
    opacity = i ? source.options.opacity : source.options.fillOpacity;
    if (!positions.length) continue;
    ({ r, g, b } = parseColor(color));
    putNativeMesh(state, key, positions, /* alloc */ [r, g, b], opacity ?? 1);
    if (key === 'stroke' && source.options.interactive === false && state.strokeCoordinates) {
      attributes = state.meshes.get(key).geometry.attributes;
      state.strokeCoordinates = attributes.position.data;
      state.strokeAnchors = attributes.normal.data;
    }
  }
}
