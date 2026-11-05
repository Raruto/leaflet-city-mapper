export function moveCameraTouch(event) {
  const state = this._cameraTouchState, { map, container, touch } = state;
  if (!touch || event.touches.length !== 2) return;
  const [a, b] = event.touches;
  const angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
  const middle = new L.Point((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2)
    .subtract(new L.Point(container.getBoundingClientRect().left, container.getBoundingClientRect().top));
  const delta = Math.atan2(Math.sin(angle - touch.angle), Math.cos(angle - touch.angle)) * 180 / Math.PI;
  map._setPitchAndBearing(map.touchPitch.enabled() ? touch.pitch - (middle.y - touch.middle.y) * 0.25 : touch.pitch,
    map.touchRotate.enabled() ? touch.bearing + delta : touch.bearing);
  const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  if (distance < 1) return;
  const zoom = touch.zooming ? Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(),
    touch.zoom + Math.log2(distance / touch.distance))) : touch.zoom;
  map.setView(map.getCenter(), zoom, { animate: false });
  if (map.options.touchZoom !== 'center') {
    const projected = map.project(touch.anchor).subtract(map.project(map.containerPointToLatLng(middle)));
    map.setView(map.unproject(map.project(map.getCenter()).add(projected)), map.getZoom(), { animate: false });
  }
  event.preventDefault();
  event.stopImmediatePropagation();
}
