import { zoomLevelByLayer } from '../weakmaps/zoomLevelByLayer.js';
import { mutateWeakMap } from '../weakmaps/mutateWeakMap.js';



/** Preserve the outgoing tile level before Leaflet changes its logical zoom. */

export function startZoom() {
  mutateWeakMap(zoomLevelByLayer, this, "=", null);
}
