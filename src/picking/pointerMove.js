import * as onPointerMove from './onPointerMove.js';

/**
 * Forward pointer movement to the layer's feature handler.
 *
 * @param {PointerEvent} event Pointer movement event.
 */
export function pointerMove(event) {
  onPointerMove.onPointerMove(this, event);
}
