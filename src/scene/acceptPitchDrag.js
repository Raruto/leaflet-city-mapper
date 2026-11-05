export function acceptPitchDrag(event) {
  return !event.target.closest('.leaflet-control,.leaflet-marker-icon,.leaflet-popup') &&
    (event.button === 2 || event.button === 0 && event.ctrlKey);
}
