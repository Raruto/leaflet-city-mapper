import { mapCameraState } from '../constants/mapCameraState.js';
import { displayPoint } from '../camera/displayPoint.js';

export function markerSetPos(point) {
  mapCameraState.markerMethods._setPos.call(this, displayPoint(this._map, point));
  for (const [element, key] of [[this._icon, 'iconAnchor'], [this._shadow, 'shadowAnchor']]) {
    if (!element) continue;
    const direction = this._cameraIconPoint(1, 0), options = this.options.icon.options;
    const anchor = options[key] || options.iconAnchor;
    element.style.transformOrigin = anchor ? `${anchor.x ?? anchor[0]}px ${anchor.y ?? anchor[1]}px` : 'center';
    element.style.transform += ` rotate(${Math.atan2(direction.y, direction.x)}rad) scale(${this.options.scale})`;
  }
}
