import { cameraDraggableByMap } from '../weakmaps/cameraDraggableByMap.js';
import { pitchSkyByMap } from '../weakmaps/pitchSkyByMap.js';



import { cancelCameraAnimation } from './cancelCameraAnimation.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cleanupCameraMap() {
  cancelCameraAnimation(this);
  pitchSkyByMap.get(this)?.remove();
  if (cameraDraggableByMap.get(this)) {
    cameraDraggableByMap.get(this).off('predrag', adjustCameraDrag, this);
    cameraDraggableByMap.delete(this);
  }
}
