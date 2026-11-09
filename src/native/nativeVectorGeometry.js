import { geometryPixelStates } from '../globals/geometryPixelStates.js';
import { nativeGeometry } from '../geometry/nativeGeometry.js';
import { localPixelForGeometry } from '../projections/localPixelForGeometry.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { radians } from '../globals/radians.js';
import { L } from '../globals/L.js';

export function nativeVectorGeometry(state) {
  const { source } = state;
  state.strokeCoordinates = null;
  state.strokeAnchors = source instanceof L.Polyline && !source.options.dashArray ? /* alloc */ [] : null;
  const crs = state.map.options.crs, origin = locationByLayer.get(state.backend);
  state.pixelProjection = /* alloc */ {
    transformation: crs.transformation, scale: crs.scale(state.map.getZoom()),
    origin: crs.project(origin), metres: Math.cos(origin.lat * radians),
  };
  geometryPixelStates.push(state);
  try {
    return nativeGeometry(source, state.map, localPixelForGeometry);
  } finally {
    geometryPixelStates.pop();
  }
}
