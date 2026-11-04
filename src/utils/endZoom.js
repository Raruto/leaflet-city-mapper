import { update } from "./update.js";

/** Stop using the outgoing level after zoomend; the next redraw uses current tiles. */

export function endZoom() {
  const backend = this;
  for (const animation of backend._zoomTransitions?.keys() || []) animation.finish();
  backend._zoomTransitions = null;
  backend._zoomView = null;
  delete backend._map._cameraView;
  backend._map.getContainer().classList.remove('leaflet-camera-zoom');
  backend._map._updateCameraOverlays();
  backend._zoomLevel = null;
  update(backend);
}
