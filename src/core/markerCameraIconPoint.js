import { state as sharedState } from '../state.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';

export function markerCameraIconPoint(marker, x, y) {
  let rotation = marker.options.rotation + (marker.options.rotateWithView ? mapGetBearing(marker._map) * sharedState.radians : 0);
  if (marker.options.keepUpright && Math.cos(rotation) < 0) rotation += Math.PI;
  const scale = marker.options.scale;
  return /* allocation: required -- Each transformed icon coordinate returns an independent native point. */ new L.Point((x * Math.cos(rotation) - y * Math.sin(rotation)) * scale,
    (x * Math.sin(rotation) + y * Math.cos(rotation)) * scale);
}
