import { cameraTouchStateByMap } from '../weakmaps/cameraTouchStateByMap.js';
import { touchPitchByMap } from '../weakmaps/touchPitchByMap.js';
import { touchRotateByMap } from '../weakmaps/touchRotateByMap.js';
import { endCameraTouch } from './endCameraTouch.js';

/** Coordinate this map's native touch zoom with its camera touch handlers. */
export function changeCameraTouch() {
  const state = cameraTouchStateByMap.get(this), { map, container } = state;
  const active = touchRotateByMap.get(map).enabled() || touchPitchByMap.get(map).enabled();
  if (active && state.nativeZoom === undefined) {
    state.nativeZoom = map.touchZoom?.enabled();
    map.touchZoom?.disable();
  } else if (!active && state.nativeZoom !== undefined) {
    endCameraTouch(state);
    if (state.nativeZoom && container._leaflet_id) map.touchZoom.enable();
    state.nativeZoom = undefined;
  }
}
