import { pluginState } from '../core/pluginState.js';
import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cleanupCameraMap() {
  cancelCameraAnimation(this);
  pluginState(this)._pitchSky?.remove();
  if (pluginState(this)._cameraDraggable) {
    pluginState(this)._cameraDraggable.off('predrag', adjustCameraDrag, this);
    delete pluginState(this)._cameraDraggable;
  }
}
