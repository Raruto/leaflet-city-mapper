import { editable } from './editable.js';

export function shiftRotateWheel(event) {
  const handler = this._cameraShiftRotate;
  if (!event.shiftKey || editable(event.target) || event.target.closest('.leaflet-control')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  handler._map.setBearing(handler._map.getBearing() + Math.sign(event.deltaY) * 5);
}
