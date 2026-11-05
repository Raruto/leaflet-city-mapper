import { endCameraTouch } from './endCameraTouch.js';

export function changeCameraTouch() {
  const state = this._cameraTouchState, { map, container } = state;
  const active = map.touchRotate.enabled() || map.touchPitch.enabled();
  if (active && state.nativeZoom === undefined) {
    state.nativeZoom = map.touchZoom?.enabled();
    map.touchZoom?.disable();
  } else if (!active && state.nativeZoom !== undefined) {
    endCameraTouch(state);
    if (state.nativeZoom && container._leaflet_id) map.touchZoom.enable();
    state.nativeZoom = undefined;
  }
}
