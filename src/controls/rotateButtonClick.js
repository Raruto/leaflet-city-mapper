export function rotateButtonClick(event) {
  const control = this._rotateControl, map = control._map;
  event.preventDefault();
  if (control.options.visualizePitch) map.resetNorthPitch();
  else map.resetNorth();
  if (event.detail) map.getContainer().focus({ preventScroll: true });
}
