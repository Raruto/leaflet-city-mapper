import { cameraDraggableByMap } from '../weakmaps/cameraDraggableByMap.js';



import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cameraMapReady() {
  const draggable = this.dragging?._draggable;
  if (!draggable) return;
  cameraDraggableByMap.set(this, draggable);
  draggable.on('predrag', adjustCameraDrag, this);
}
