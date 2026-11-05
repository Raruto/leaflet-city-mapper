import { mapCameraState } from '../../camera/constants/mapCameraState.js';
import { displayPoint } from '../../camera/projection/displayPoint.js';

export function popupUpdatePosition() {
  mapCameraState.popupPosition.call(this);
  if (!this._map) return;
  const point = this._map.latLngToLayerPoint(this._latlng), delta = displayPoint(this._map, point).subtract(point);
  if (this._zoomAnimated) {
    L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
  } else {
    this._container.style.left = `${this._containerLeft + delta.x}px`;
    this._container.style.bottom = `${this._containerBottom - delta.y}px`;
  }
}
