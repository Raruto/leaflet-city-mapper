import { mapStopPitchBearingAnimation } from '../camera/mapStopPitchBearingAnimation.js';
import { mapGetBearing } from '../camera/mapGetBearing.js';
import { mapGetPitch } from '../camera/mapGetPitch.js';
import { pluginState } from '../core/pluginState.js';
export function startCameraTouch(event) {
  const state = pluginState(this)._cameraTouchState, { map, container } = state;
  if (state.touch || event.touches.length !== 2 || event.target.closest('.leaflet-control')) return;
  if (!pluginState(map).touchRotate.enabled() && !pluginState(map).touchPitch.enabled()) return;
  const [a, b] = event.touches;
  if (Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) < 1) return;
  mapStopPitchBearingAnimation(map);
  const rect = container.getBoundingClientRect();
  const middle = /* allocation: required -- This gesture retains its starting midpoint throughout later moves. */ new L.Point(
    (a.clientX + b.clientX) / 2 - rect.left, (a.clientY + b.clientY) / 2 - rect.top);
  state.touch = /* allocation: required -- Each gesture owns its starting camera and restoration state. */ {
    angle: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX),
    distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), middle,
    anchor: map.containerPointToLatLng(middle), zoom: map.getZoom(),
    bearing: mapGetBearing(map), pitch: mapGetPitch(map), zooming: map.touchZoom?.enabled(),
    dragging: map.dragging?.enabled(),
    currentMiddle: /* allocation: required -- This gesture reuses a moving point without overwriting its initial midpoint. */ new L.Point(middle.x, middle.y),
  };
  map.dragging?.disable();
  event.preventDefault();
  event.stopImmediatePropagation();
  if (state.nativeZoom !== undefined) state.touch.zooming = state.nativeZoom;
  state.touch.snap = map.options.zoomSnap;
  map.options.zoomSnap = 0;
}
