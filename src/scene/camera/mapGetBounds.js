import { mapCameraState } from './constants/mapCameraState.js';
import { groundBounds } from './projection/groundBounds.js';
import { animationPoint } from './animation/animationPoint.js';

export function mapGetBounds() {
  if (!this.getPitch() && !this.getBearing()) return mapCameraState.mapMethods.getBounds.call(this);
  const footprint = groundBounds(this), bounds = new L.LatLngBounds();
  for (const point of [footprint.min, footprint.max]) {
    const raw = mapCameraState.mapMethods.containerPointToLayerPoint.call(this, animationPoint(this, point, true));
    bounds.extend(this.layerPointToLatLng(raw));
  }
  return bounds;
}
