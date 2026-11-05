import { mapCameraState } from './constants/mapCameraState.js';
import { fitCameraBounds } from './fitCameraBounds.js';
import { pointOf } from './pointOf.js';
import { groundBounds } from './groundBounds.js';

export function mapGetBoundsZoom(bounds, inside, padding) {
  if (!this.getPitch() && !this.getBearing()) return mapCameraState.mapMethods.getBoundsZoom.call(this, bounds, inside, padding);
  if (!inside) return fitCameraBounds(this, bounds, { padding: pointOf(padding || [0, 0]).divideBy(2) }).zoom;
  bounds = bounds instanceof L.LatLngBounds ? bounds : new L.LatLngBounds(bounds);
  const footprint = groundBounds(this, padding).getSize(), size = this.project(bounds.getSouthEast()).subtract(this.project(bounds.getNorthWest()));
  const zoom = this.getScaleZoom(Math.max(footprint.x / size.x, footprint.y / size.y));
  const snap = this.options.zoomSnap;
  return Math.max(this.getMinZoom(), Math.min(this.getMaxZoom(), snap ? Math.ceil(zoom / snap) * snap : zoom));
}
