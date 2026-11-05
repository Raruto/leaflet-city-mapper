import { pluginState } from '../core/pluginState.js';
import { adjustCameraDrag } from '../controls/adjustCameraDrag.js';

export function cameraMapReady() {
  const draggable = this.dragging?._draggable;
  if (!draggable) return;
  pluginState(this)._cameraDraggable = draggable;
  draggable.on('predrag', adjustCameraDrag, this);
}
