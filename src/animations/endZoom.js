import { zoomLevelByLayer } from '../weakmaps/zoomLevelByLayer.js';
import { zoomTransitionsByLayer } from '../weakmaps/zoomTransitionsByLayer.js';
import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/** Stop using the outgoing level after zoomend; the next redraw uses current tiles. */
export function endZoom() {
  const layer = this;
  let animation;
  if (zoomTransitionsByLayer.get(layer)) {
    for (animation of zoomTransitionsByLayer.get(layer).keys()) animation.finish();
  }
  zoomTransitionsByLayer.set(layer, null);
  zoomViewByLayer.set(layer, null);
  cameraViewByMap.delete(layer._map);
  layer._map.getContainer().classList.remove('leaflet-camera-zoom');
  mapUpdateCameraOverlays(layer._map);
  zoomLevelByLayer.set(layer, null);
  update(layer);
}
