import { mapCameraState } from '../constants/mapCameraState.js';

export function gridlayerGetEvents() {
  const events = mapCameraState.gridEvents.call(this);
  this._cameraGridUpdate ||= L.Util.throttle(this._onMoveEnd, this.options.updateInterval, this);
  return { ...events, rotate: this._cameraGridUpdate, pitch: this._cameraGridUpdate };
}
