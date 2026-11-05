import { pluginState } from '../core/pluginState.js';
import { endCameraTouch } from './endCameraTouch.js';

export function changeCameraTouch() {
  const state = pluginState(this)._cameraTouchState, { map, container } = state;
  const active = pluginState(map).touchRotate.enabled() || pluginState(map).touchPitch.enabled();
  if (active && state.nativeZoom === undefined) {
    state.nativeZoom = map.touchZoom?.enabled();
    map.touchZoom?.disable();
  } else if (!active && state.nativeZoom !== undefined) {
    endCameraTouch(state);
    if (state.nativeZoom && container._leaflet_id) map.touchZoom.enable();
    state.nativeZoom = undefined;
  }
}
