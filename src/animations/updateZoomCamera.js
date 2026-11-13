import { zoomTransitionsByLayer } from '../weakmaps/zoomTransitionsByLayer.js';
import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';
import { cameraViewByMap } from '../weakmaps/cameraViewByMap.js';
import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';

/**
 * Interpolate the map's camera view from the current zoom transition.
 *
 * @param {L.Layer} layer Layer whose map view is being animated.
 * @param {number} now Current frame timestamp in milliseconds.
 */
export function updateZoomCamera(layer, now) {
  const map = layer._map;
  const view = zoomViewByLayer.get(layer);
  let proxy, animation;
  for (animation of zoomTransitionsByLayer.get(layer).keys()) {
    if (animation.effect.target === map._proxy) { proxy = animation; break; }
  }
  const progress = proxy?.effect.getComputedTiming().progress ?? Math.min(1, (now - view.start) / 250);
  const targetScale = map.getZoomScale(view.targetZoom, view.zoom), scale = 1 + (targetScale - 1) * progress;
  const from = map.project(view.from, view.zoom), to = map.project(view.to, view.zoom);
  cameraViewByMap.set(map, /* alloc */ { zoom: map.getScaleZoom(scale, view.zoom),
    center: map.unproject(from.add(to.subtract(from).multiplyBy(targetScale * progress / scale)), view.zoom) });
  mapUpdateCameraOverlays(map);
}
