import { touchPitchByMap } from '../weakmaps/touchPitchByMap.js';
import { touchRotateByMap } from '../weakmaps/touchRotateByMap.js';
import { L } from '../globals/L.js';
import { touchByContainer } from '../weakmaps/touchByContainer.js';
import { mapStopPitchBearingAnimation } from '../animations/mapStopPitchBearingAnimation.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';

/**
 * Start a two-finger camera gesture and retain its initial anchor and map state.
 *
 * @param {TouchEvent} event Touch-start event.
 */
export function startCameraTouch(event) {
  const state = touchByContainer.get(this), { map, container } = state;
  if (state.touch || event.touches.length !== 2 || event.target.closest('.leaflet-control')) return;
  if (!touchRotateByMap.get(map).enabled() && !touchPitchByMap.get(map).enabled()) return;
  const [a, b] = event.touches;
  if (Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) < 1) return;
  mapStopPitchBearingAnimation(map);
  const rect = container.getBoundingClientRect();
  const middle = /* alloc */ new L.Point(
    (a.clientX + b.clientX) / 2 - rect.left, (a.clientY + b.clientY) / 2 - rect.top);
  state.touch = /* alloc */ {
    angle: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX),
    distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), middle,
    anchor: map.containerPointToLatLng(middle), zoom: map.getZoom(),
    bearing: mapGetBearing(map), pitch: mapGetPitch(map), zooming: map.touchZoom?.enabled(),
    dragging: map.dragging?.enabled(),
    currentMiddle: /* alloc */ new L.Point(middle.x, middle.y),
  };
  map.dragging?.disable();
  event.preventDefault();
  event.stopImmediatePropagation();
  if (state.nativeZoom !== undefined) state.touch.zooming = state.nativeZoom;
  state.touch.snap = map.options.zoomSnap;
  map.options.zoomSnap = 0;
}
