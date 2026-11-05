import { geometryPixelStates } from '../globals/geometryPixelStates.js';


import { nativeGeometry } from '../geometry/nativeGeometry.js';
import { localPixelForGeometry } from './localPixelForGeometry.js';
import { parseColor } from '../utils/parseColor.js';
import { putNativeMesh } from './putNativeMesh.js';

export function syncVectorLayer(state) {
  const { source } = state;
  geometryPixelStates.push(state);
  let geometry;
  try {
    geometry = nativeGeometry(source, state.map, localPixelForGeometry);
  } finally {
    geometryPixelStates.pop();
  }
  const { fill, stroke } = geometry;
  let i, key, positions, color, opacity, r, g, b;
  for (i = 0; i < 2; i++) {
    key = i ? 'stroke' : 'fill';
    positions = i ? stroke : fill;
    color = i ? source.options.color : source.options.fillColor || source.options.color;
    opacity = i ? source.options.opacity : source.options.fillOpacity;
    if (!positions.length) continue;
    ({ r, g, b } = parseColor(color));
    putNativeMesh(state, key, positions, /* allocation: required -- Each mesh material retains its own mutable uniform color. */ [r, g, b], opacity ?? 1);
  }
}
