export function startCameraTouch(event) {
  const state = this._cameraTouchState, { map, container } = state;
  if (state.touch || event.touches.length !== 2 || event.target.closest('.leaflet-control')) return;
  if (!map.touchRotate.enabled() && !map.touchPitch.enabled()) return;
  const [a, b] = event.touches;
  if (Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) < 1) return;
  map._stopPitchBearingAnimation();
  const middle = new L.Point((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2)
    .subtract(new L.Point(container.getBoundingClientRect().left, container.getBoundingClientRect().top));
  state.touch = {
    angle: Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX),
    distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY), middle,
    anchor: map.containerPointToLatLng(middle), zoom: map.getZoom(),
    bearing: map.getBearing(), pitch: map.getPitch(), zooming: map.touchZoom?.enabled(),
    dragging: map.dragging?.enabled(),
  };
  map.dragging?.disable();
  event.preventDefault();
  event.stopImmediatePropagation();
  if (state.nativeZoom !== undefined) state.touch.zooming = state.nativeZoom;
  state.touch.snap = map.options.zoomSnap;
  map.options.zoomSnap = 0;
}
