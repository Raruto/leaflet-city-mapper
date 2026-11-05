import { pointOf } from '../camera/pointOf.js';
import { scheduleMarkerPan } from './scheduleMarkerPan.js';

export function adjustCameraMarkerPan(event) {
  const marker = this._marker, map = marker._map;
  if (!map.getPitch() && !map.getBearing()) return this._cameraOriginalAdjustPan.call(this, event);
  const screen = L.DomUtil.getPosition(marker._icon).add(map._getMapPanePos());
  const size = map.getSize(), padding = pointOf(marker.options.autoPanPadding);
  const speed = marker.options.autoPanSpeed;
  const movement = new L.Point(
    (Math.max(0, screen.x - size.x + padding.x) - Math.max(0, padding.x - screen.x)) / Math.max(1, padding.x) * speed,
    (Math.max(0, screen.y - size.y + padding.y) - Math.max(0, padding.y - screen.y)) / Math.max(1, padding.y) * speed);
  if (!movement.x && !movement.y) return;
  const pane = map._getMapPanePos();
  map.panBy(movement, { animate: false });
  const shift = pane.subtract(map._getMapPanePos());
  this._draggable._newPos._add(shift);
  this._draggable._startPos._add(shift);
  L.DomUtil.setPosition(marker._icon, this._draggable._newPos);
  this._onDrag(event);
  scheduleMarkerPan(this, event);
}
