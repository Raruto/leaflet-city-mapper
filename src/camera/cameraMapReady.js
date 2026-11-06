import { cameraDraggableByMap } from '../weakmaps/cameraDraggableByMap.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cameraMapReady() {
  const draggable = this.dragging?._draggable;
  if (!draggable) return;
  mutateWeakMap(cameraDraggableByMap, this, "=", draggable);
  draggable.on('predrag', adjustCameraDrag, this);
}
