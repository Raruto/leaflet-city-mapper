export function onPointer(event) {
  // Dragging only turns the camera around the walker: horizontal = bearing, vertical = pitch.
  const map = this.layer._map;
  if (event.type === 'pointerdown') {
    if (event.button !== 0 || event.target.closest('.leaflet-control')) return;
    this.drag = { x: event.clientX, y: event.clientY };
    map.getContainer().setPointerCapture(event.pointerId);
  } else if (this.drag && event.type === 'pointermove') {
    map._setPitchAndBearing(Math.max(20, Math.min(85, map.getPitch() - (event.clientY - this.drag.y) * 0.2)),
      map.getBearing() - (event.clientX - this.drag.x) * 0.25);
    this.drag = { x: event.clientX, y: event.clientY };
  } else this.drag = null;
}
