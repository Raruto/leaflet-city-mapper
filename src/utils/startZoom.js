import { getTileLevel } from "./getTileLevel.js";

/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  const backend = this;
  backend._zoomLevel = getTileLevel(backend);
}
