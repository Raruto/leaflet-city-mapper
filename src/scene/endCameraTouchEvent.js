import { endCameraTouch } from './endCameraTouch.js';

export function endCameraTouchEvent(event) {
  endCameraTouch(this._cameraTouchState, event);
}
