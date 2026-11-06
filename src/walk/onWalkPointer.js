import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
export function onPointer(event) {
  // Dragging only turns the camera around the walker: horizontal = bearing, vertical = pitch.
  const map = this.layer._map;
  if (event.type === 'pointerdown') {
    if (event.button !== 0 || event.target.closest('.leaflet-control')) return;
    this.dragX = event.clientX;
    this.dragY = event.clientY;
    this.dragging = true;
    map.getContainer().setPointerCapture(event.pointerId);
  } else if (this.dragging && event.type === 'pointermove') {
    mapSetPitchAndBearing(map, Math.max(20, Math.min(85, mapGetPitch(map) - (event.clientY - this.dragY) * 0.2)), mapGetBearing(map) - (event.clientX - this.dragX) * 0.25);
    this.dragX = event.clientX;
    this.dragY = event.clientY;
  } else this.dragging = false;
}
