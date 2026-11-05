import { mapCameraState } from './constants/mapCameraState.js';

export function tooltipGetEvents() {
  return { ...mapCameraState.tooltipEvents.call(this), rotate: this._updatePosition, pitch: this._updatePosition, move: this._updatePosition };
}
