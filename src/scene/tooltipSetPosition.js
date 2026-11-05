import { mapCameraState } from './constants/mapCameraState.js';
import { displayPoint } from './displayPoint.js';

export function tooltipSetPosition(point) {
  mapCameraState.tooltipPosition.call(this, point);
  const delta = displayPoint(this._map, point).subtract(point);
  L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
}
