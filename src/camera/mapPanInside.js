import { state as sharedState } from '../state.js';
import { mapGetPitch } from './mapGetPitch.js';
import { mapGetBearing } from './mapGetBearing.js';

import { pointOf } from './pointOf.js';

export function mapPanInside(latlng, options = /* allocation: required -- Native pan/view methods mutate and retain options across callbacks. */ {}) {
  if (!mapGetPitch(this) && !mapGetBearing(this)) return sharedState.mapMethods.panInside.call(this, latlng, options);
  const min = pointOf(options.paddingTopLeft || options.padding || sharedState.allocationCameraZeroPadding);
  const max = this.getSize().subtract(pointOf(options.paddingBottomRight || options.padding || sharedState.allocationCameraZeroPadding));
  const screen = this.latLngToContainerPoint(latlng);
  const safe = min;
  safe.x = Math.max(min.x, Math.min(max.x, screen.x));
  safe.y = Math.max(min.y, Math.min(max.y, screen.y));
  if (safe.equals(screen)) return this;
  const delta = this.latLngToLayerPoint(latlng).subtract(this.containerPointToLayerPoint(safe));
  return this.panTo(this.unproject(this.project(this.getCenter()).add(delta)), options);
}
