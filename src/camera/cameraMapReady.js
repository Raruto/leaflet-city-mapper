import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cameraMapReady() {
  const draggable = this.dragging?._draggable;
  if (!draggable) return;
  this._cameraDraggable = draggable;
  draggable.on('predrag', adjustCameraDrag, this);
}
