/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  this._zoomLevel = null;
}
