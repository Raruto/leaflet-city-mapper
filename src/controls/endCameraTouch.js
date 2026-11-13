/**
 * End a camera touch gesture and restore map dragging and zoom snapping.
 *
 * @param {Object} state Camera touch state.
 * @param {TouchEvent} [event] Touch completion event.
 */
export function endCameraTouch(state, event) {
  if (!state.touch) return;
  if (event?.touches?.length >= 2) return;
  const { map, container, touch } = state;
  if (touch.dragging && container._leaflet_id) map.dragging.enable();
  map.options.zoomSnap = touch.snap;
  if (touch.zooming && touch.snap && container._leaflet_id) {
    map.setZoom(Math.round(map.getZoom() / touch.snap) * touch.snap,
      /* alloc */ { animate: false });
  }
  state.touch = null;
}
