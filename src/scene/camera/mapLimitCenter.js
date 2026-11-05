import { mapCameraState } from './constants/mapCameraState.js';
import { groundBounds } from './projection/groundBounds.js';

export function mapLimitCenter(center, zoom, bounds) {
  if (!bounds || !this._loaded || !this.getPitch() && !this.getBearing()) {
    return mapCameraState.mapMethods._limitCenter.call(this, center, zoom, bounds);
  }
  const half = this.getSize().divideBy(2), footprint = groundBounds(this), point = this.project(center, zoom);
  const view = new L.Bounds(point.add(footprint.min.subtract(half)), point.add(footprint.max.subtract(half)));
  const offset = this._getBoundsOffset(view, bounds, zoom);
  return Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1 ? center : this.unproject(point.add(offset), zoom);
}
