/**
 * Finish an active camera drag and restore pointer capture, map dragging and cursor.
 *
 * @param {Object} state Camera drag state.
 * @param {PointerEvent} [event] Pointer completion event.
 */
export function finishCameraDrag(state, event) {
  if (!state?.drag) return;
  if (event?.pointerId !== undefined && event.pointerId !== state.drag.id) return;
  const finished = state.drag;
  state.drag = null;
  if (state.element.hasPointerCapture?.(finished.id)) state.element.releasePointerCapture(finished.id);
  if (finished.dragging && state.map.getContainer()._leaflet_id) state.map.dragging.enable();
  state.element.style.cursor = finished.cursor;
}
