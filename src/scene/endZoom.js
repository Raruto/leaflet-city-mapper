import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';
import { pluginState } from '../core/pluginState.js';
import { update } from './update.js';

/** Stop using the outgoing level after zoomend; the next redraw uses current tiles. */

export function endZoom() {
  const backend = this;
  let animation;
  if (pluginState(backend)._zoomTransitions) {
    for (animation of pluginState(backend)._zoomTransitions.keys()) animation.finish();
  }
  pluginState(backend)._zoomTransitions = null;
  pluginState(backend)._zoomView = null;
  delete pluginState(backend._map)._cameraView;
  backend._map.getContainer().classList.remove('leaflet-camera-zoom');
  mapUpdateCameraOverlays(backend._map);
  pluginState(backend)._zoomLevel = null;
  update(backend);
}
