import { mapCameraState } from './constants/mapCameraState.js';
import { pointOf } from './projection/pointOf.js';

export function mapPanInside(latlng, options = {}) {
  if (!this.getPitch() && !this.getBearing()) return mapCameraState.mapMethods.panInside.call(this, latlng, options);
  const min = pointOf(options.paddingTopLeft || options.padding || [0, 0]);
  const max = this.getSize().subtract(pointOf(options.paddingBottomRight || options.padding || [0, 0]));
  const screen = this.latLngToContainerPoint(latlng);
  const safe = new L.Point(Math.max(min.x, Math.min(max.x, screen.x)),
    Math.max(min.y, Math.min(max.y, screen.y)));
  if (safe.equals(screen)) return this;
  const delta = this.latLngToLayerPoint(latlng).subtract(this.containerPointToLayerPoint(safe));
  return this.panTo(this.unproject(this.project(this.getCenter()).add(delta)), options);
}
