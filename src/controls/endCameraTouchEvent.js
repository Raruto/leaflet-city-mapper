import { pluginState } from '../core/pluginState.js';
import { endCameraTouch } from './endCameraTouch.js';

export function endCameraTouchEvent(event) {
  endCameraTouch(pluginState(this)._cameraTouchState, event);
}
