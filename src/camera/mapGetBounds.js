import { state as sharedState } from '../state.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { groundBounds } from './groundBounds.js';
import { animationPoint } from './animationPoint.js';

export function mapGetBounds() {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return sharedState.mapMethods.getBounds.call(this);
  const footprint = groundBounds(this), bounds = /* allocation: required -- Each bounds query returns independent mutable native bounds. */ new L.LatLngBounds();
  let i, point, raw;
  for (i = 0; i < 2; i++) {
    point = i ? footprint.max : footprint.min;
    raw = sharedState.mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, point, true));
    bounds.extend(this.layerPointToLatLng(raw));
  }
  return bounds;
}
