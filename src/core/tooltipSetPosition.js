import { L } from '../globals/L.js';
import { tooltipPosition } from '../globals/tooltipPosition.js';


import { displayPoint } from '../projections/displayContainerPoint.js';

export function tooltipSetPosition(point) {
  tooltipPosition.value.call(this, point);
  const delta = displayPoint(this._map, point).subtract(point);
  L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
}
