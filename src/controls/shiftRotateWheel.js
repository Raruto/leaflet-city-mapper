import { mapSetBearing } from '../camera/mapSetBearing.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { editable } from './editable.js';

export function shiftRotateWheel(event) {
  const handler = this._cameraShiftRotate;
  if (!event.shiftKey || editable(event.target) || event.target.closest('.leaflet-control')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  mapSetBearing(handler._map, mapGetBearing(handler._map) + Math.sign(event.deltaY) * 5);
}
