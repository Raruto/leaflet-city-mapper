import { state as sharedState } from '../state.js';

import { displayPoint } from '../camera/displayPoint.js';

export function tooltipSetPosition(point) {
  sharedState.tooltipPosition.call(this, point);
  const delta = displayPoint(this._map, point).subtract(point);
  L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
}
