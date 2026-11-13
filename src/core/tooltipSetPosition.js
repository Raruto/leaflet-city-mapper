import { L } from '../globals/L.js';
import { tooltipPosition } from '../globals/tooltipPosition.js';
import { displayPoint } from '../projections/displayContainerPoint.js';

/**
 * Set this tooltip's position and apply the camera display offset.
 *
 * @param {L.Point} point Tooltip layer point.
 */
export function tooltipSetPosition(point) {
  tooltipPosition.value.call(this, point);
  const delta = displayPoint(this._map, point, this._latlng).subtract(point);
  L.DomUtil.setPosition(this._container, L.DomUtil.getPosition(this._container).add(delta));
}
