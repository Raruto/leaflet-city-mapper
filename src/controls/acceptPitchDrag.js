/**
 * Accept a right-button or Ctrl-left drag outside controls, markers and popups.
 *
 * @param {PointerEvent} event Pointer event.
 *
 * @returns {boolean} Whether the drag can start.
 */
export function acceptPitchDrag(event) {
  return !event.target.closest('.leaflet-control,.leaflet-marker-icon,.leaflet-popup') &&
    (event.button === 2 || event.button === 0 && event.ctrlKey);
}
