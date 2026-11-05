import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { adjustCameraDrag } from './adjustCameraDrag.js';

export function cleanupCameraMap() {
  cancelCameraAnimation(this);
  this._pitchSky?.remove();
  if (this._cameraDraggable) {
    this._cameraDraggable.off('predrag', adjustCameraDrag, this);
    delete this._cameraDraggable;
  }
}
