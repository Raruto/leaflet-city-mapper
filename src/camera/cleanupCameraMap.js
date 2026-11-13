import { cameraDraggableByMap } from '../weakmaps/cameraDraggableByMap.js';
import { pitchSkyByMap } from '../weakmaps/pitchSkyByMap.js';
import { cancelCameraAnimation } from '../animations/cancelCameraAnimation.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

/** Cancel this map's camera animation and remove its sky and drag listener. */
export function cleanupCameraMap() {
  cancelCameraAnimation(this);
  pitchSkyByMap.get(this)?.remove();
  if (cameraDraggableByMap.get(this)) {
    cameraDraggableByMap.get(this).off('predrag', adjustCameraDrag, this);
    cameraDraggableByMap.delete(this);
  }
}
