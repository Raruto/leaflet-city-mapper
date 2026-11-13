import { dragStates } from '../weakmaps/dragStates.js';
import { finishCameraDrag } from './finishCameraDrag.js';

/**
 * Finish the camera drag associated with this element.
 *
 * @param {PointerEvent} event Pointer completion event.
 */
export function cameraDragEnd(event) {
  finishCameraDrag(dragStates.value.get(this), event);
}
