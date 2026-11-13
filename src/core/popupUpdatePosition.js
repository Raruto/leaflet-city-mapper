import { L } from '../globals/L.js';
import { popupPosition } from '../globals/popupPosition.js';
import { displayPoint } from '../projections/displayContainerPoint.js';

/** Update this popup's position and apply the camera display offset. */
export function popupUpdatePosition() {
  popupPosition.value.call(this);
  if (!this._map) return;
  const point = this._map.latLngToLayerPoint(this._latlng), delta = displayPoint(this._map, point, this._latlng).subtract(point);
  if (this._zoomAnimated) {
    L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
  } else {
    this._container.style.left = `${this._containerLeft + delta.x}px`;
    this._container.style.bottom = `${this._containerBottom - delta.y}px`;
  }
}
