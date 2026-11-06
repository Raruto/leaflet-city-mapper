import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';

export function updateZoomCamera(backend, now) {
  const map = backend._map;
  const view = sceneByLayer.get(backend)._zoomView;
  let proxy, animation;
  for (animation of sceneByLayer.get(backend)._zoomTransitions.keys()) {
    if (animation.effect.target === map._proxy) { proxy = animation; break; }
  }
  const progress = proxy?.effect.getComputedTiming().progress ?? Math.min(1, (now - view.start) / 250);
  const targetScale = map.getZoomScale(view.targetZoom, view.zoom), scale = 1 + (targetScale - 1) * progress;
  const from = map.project(view.from, view.zoom), to = map.project(view.to, view.zoom);
  cameraByMap.get(map)._cameraView = /* alloc */ { zoom: map.getScaleZoom(scale, view.zoom),
    center: map.unproject(from.add(to.subtract(from).multiplyBy(targetScale * progress / scale)), view.zoom) };
  mapUpdateCameraOverlays(map);
}
