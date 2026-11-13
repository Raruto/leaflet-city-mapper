import { markerMethods } from '../globals/markerMethods.js';
import { markerCameraIconPoint } from '../projections/markerCameraIconPoint.js';
import { displayPoint } from '../projections/displayContainerPoint.js';

/**
 * Position and orient this marker's icon and shadow under the current camera.
 *
 * @param {L.Point} point Marker layer point.
 */
export function markerSetPos(point) {
  markerMethods.value._setPos.call(this, displayPoint(this._map, point, this.getLatLng()));
  let i, element, key, direction, options, anchor;
  for (i = 0; i < 2; i++) {
    element = i ? this._shadow : this._icon;
    key = i ? 'shadowAnchor' : 'iconAnchor';
    if (!element) continue;
    direction = markerCameraIconPoint(this, 1, 0), options = this.options.icon.options;
    anchor = options[key] || options.iconAnchor;
    element.style.transformOrigin = anchor ? `${anchor.x ?? anchor[0]}px ${anchor.y ?? anchor[1]}px` : 'center';
    element.style.transform += ` rotate(${Math.atan2(direction.y, direction.x)}rad) scale(${this.options.scale})`;
  }
}
