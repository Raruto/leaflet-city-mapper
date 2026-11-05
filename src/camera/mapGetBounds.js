import { L } from '../globals/L.js';
import { mapMethods } from '../globals/mapMethods.js';

import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { groundBounds } from './groundBounds.js';
import { animationPoint } from './animationPoint.js';

export function mapGetBounds() {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return mapMethods.value.getBounds.call(this);
  const footprint = groundBounds(this), bounds = /* allocation: required -- Each bounds query returns independent mutable native bounds. */ new L.LatLngBounds();
  let i, point, raw;
  for (i = 0; i < 2; i++) {
    point = i ? footprint.max : footprint.min;
    raw = mapMethods.value.containerPointToLayerPoint.call(this, animationPoint(this, point, true));
    bounds.extend(this.layerPointToLatLng(raw));
  }
  return bounds;
}
