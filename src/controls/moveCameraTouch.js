import { degrees } from '../globals/degrees.js';
import { touchByContainer } from '../globals/touchByContainer.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { mapSetPitchAndBearing } from '../camera/mapSetPitchAndBearing.js';

export function moveCameraTouch(event) {
  const state = touchByContainer.get(this), { map, container, touch } = state;
  if (!touch || event.touches.length !== 2) return;
  const [a, b] = event.touches;
  const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
  const rect = container.getBoundingClientRect(), middle = touch.currentMiddle;
  middle.x = (a.clientX + b.clientX) / 2 - rect.left;
  middle.y = (a.clientY + b.clientY) / 2 - rect.top;
  const delta = Math.atan2(Math.sin(angle - touch.angle), Math.cos(angle - touch.angle)) * degrees;
  mapSetPitchAndBearing(map, cameraByMap.get(map).touchPitch.enabled() ? touch.pitch - (middle.y - touch.middle.y) * 0.25 : touch.pitch, cameraByMap.get(map).touchRotate.enabled() ? touch.bearing + delta : touch.bearing);
  const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  if (distance < 1) return;
  const zoom = touch.zooming ? Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(),
    touch.zoom + Math.log2(distance / touch.distance))) : touch.zoom;
  map.setView(map.getCenter(), zoom, /* allocation: required -- Leaflet mutates and retains view options during nested camera events. */ { animate: false });
  if (map.options.touchZoom !== 'center') {
    const projected = map.project(touch.anchor).subtract(map.project(map.containerPointToLatLng(middle)));
    map.setView(map.unproject(map.project(map.getCenter()).add(projected)), map.getZoom(),
      /* allocation: required -- Leaflet mutates and retains view options independently for this anchor correction. */ { animate: false });
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}
