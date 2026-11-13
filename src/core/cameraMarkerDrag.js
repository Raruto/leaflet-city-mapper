import { dragByHandler } from '../weakmaps/dragByHandler.js';
import { cameraMarkerOnDrag } from './cameraMarkerOnDrag.js';
import { adjustCameraMarkerPan } from './adjustCameraMarkerPan.js';

/** Install camera-aware drag and auto-pan handlers on this marker once. */
export function cameraMarkerDrag() {
  if (!this.dragging || dragByHandler.has(this.dragging)) return;
  const drag = this.dragging, original = drag._onDrag, adjustPan = drag._adjustPan;
  dragByHandler.set(drag, /* alloc */ {
    _cameraOriginalOnDrag: original, _cameraOriginalAdjustPan: adjustPan,
  });
  drag._onDrag = cameraMarkerOnDrag;
  drag._adjustPan = adjustCameraMarkerPan;
  // The handler may already be enabled and listening with its original method.
  const enabled = drag.enabled();
  if (enabled) {
    drag._draggable.off('drag', original, drag);
    drag._draggable.on('drag', drag._onDrag, drag);
  }
}
