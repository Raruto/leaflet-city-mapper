import { sceneByLayer } from '../globals/sceneByLayer.js';


/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  sceneByLayer.get(this)._zoomLevel = null;
}
