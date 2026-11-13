import { cameraDraggableByMap } from '../weakmaps/cameraDraggableByMap.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

/** Attach the camera drag adjustment once this map's draggable is ready. */
export function cameraMapReady() {
  const draggable = this.dragging?._draggable;
  if (!draggable) return;
  cameraDraggableByMap.set(this, draggable);
  draggable.on('predrag', adjustCameraDrag, this);
}
