import { cameraByMap } from '../globals/cameraByMap.js';


import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cleanupCameraMap() {
  cancelCameraAnimation(this);
  cameraByMap.get(this)._pitchSky?.remove();
  if (cameraByMap.get(this)._cameraDraggable) {
    cameraByMap.get(this)._cameraDraggable.off('predrag', adjustCameraDrag, this);
    delete cameraByMap.get(this)._cameraDraggable;
  }
}
