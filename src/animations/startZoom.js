import { zoomLevelByLayer } from '../weakmaps/zoomLevelByLayer.js';



/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  zoomLevelByLayer.set(this, null);
}
