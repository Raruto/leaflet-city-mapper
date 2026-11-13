import { mapSetBearing } from '../camera/mapSetBearing.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { editable } from './isEditableTarget.js';

/**
 * Rotate the map for Shift-wheel events outside editable targets and controls.
 *
 * @param {WheelEvent} event Wheel event.
 */
export function shiftRotateWheel(event) {
  const handler = this._cameraShiftRotate;
  if (!event.shiftKey || editable(event.target) || event.target.closest('.leaflet-control')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  mapSetBearing(handler._map, mapGetBearing(handler._map) + Math.sign(event.deltaY) * 5);
}
