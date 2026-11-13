/**
 * Accept a primary-button drag on the rotate control.
 *
 * @param {PointerEvent} event Pointer event.
 *
 * @returns {boolean} Whether the drag can start.
 */
export function acceptRotateDrag(event) {
  return event.button === 0;
}
