import { state as sharedState } from '../state.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { fitCameraBounds } from './fitCameraBounds.js';
import { pointOf } from './pointOf.js';
import { groundBounds } from './groundBounds.js';

export function mapGetBoundsZoom(bounds, inside, padding) {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return sharedState.mapMethods.getBoundsZoom.call(this, bounds, inside, padding);
  if (!inside) return fitCameraBounds(this, bounds,
    /* allocation: required -- Fitting may reenter through map callbacks and needs call-local padding options. */ {
      padding: pointOf(padding || sharedState.allocationCameraZeroPadding).divideBy(2),
    }).zoom;
  bounds = bounds instanceof L.LatLngBounds ? bounds
    : /* allocation: required -- Native bounds normalization must not alias caller coordinates. */ new L.LatLngBounds(bounds);
  const footprint = groundBounds(this, padding).getSize(), size = this.project(bounds.getSouthEast()).subtract(this.project(bounds.getNorthWest()));
  const zoom = this.getScaleZoom(Math.max(footprint.x / size.x, footprint.y / size.y));
  const snap = this.options.zoomSnap;
  return Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), snap ? Math.ceil(zoom / snap) * snap : zoom));
}
