import { mapCameraState } from './constants/mapCameraState.js';

export function popupGetEvents() {
  return { ...mapCameraState.popupEvents.call(this), rotate: this._updatePosition, pitch: this._updatePosition, move: this._updatePosition };
}
