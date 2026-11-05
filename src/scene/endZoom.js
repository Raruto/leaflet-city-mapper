import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';

import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';

import { update } from './update.js';

/** Stop using the outgoing level after zoomend; the next redraw uses current tiles. */

export function endZoom() {
  const backend = this;
  let animation;
  if (sceneByLayer.get(backend)._zoomTransitions) {
    for (animation of sceneByLayer.get(backend)._zoomTransitions.keys()) animation.finish();
  }
  sceneByLayer.get(backend)._zoomTransitions = null;
  sceneByLayer.get(backend)._zoomView = null;
  delete cameraByMap.get(backend._map)._cameraView;
  backend._map.getContainer().classList.remove('leaflet-camera-zoom');
  mapUpdateCameraOverlays(backend._map);
  sceneByLayer.get(backend)._zoomLevel = null;
  update(backend);
}
