import { markerMethods } from '../globals/markerMethods.js';

import { markerCameraIconPoint } from '../projections/markerCameraIconPoint.js';

import { displayPoint } from '../projections/displayContainerPoint.js';

export function markerSetPos(point) {
  markerMethods.value._setPos.call(this, displayPoint(this._map, point));
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
