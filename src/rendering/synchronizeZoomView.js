import { sceneByLayer } from '../globals/sceneByLayer.js';
import { meshStack } from '../globals/meshStack.js';
import { cameraByMap } from '../globals/cameraByMap.js';
import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';

export function synchronizeZoomView(backend, now) {
  const map = backend._map;
  let animation, time, start;
  if (map._animatingZoom) {
    sceneByLayer.get(backend)._zoomTransitions ||= /* alloc */ new Map();
    for (animation of map.getContainer().getAnimations(meshStack)) {
      if (!(animation instanceof CSSTransition) || animation.transitionProperty !== 'transform' ||
        !animation.effect.target.classList.contains('leaflet-zoom-animated') ||
        sceneByLayer.get(backend)._zoomTransitions.has(animation)) {
        continue;
      }
      time = animation.currentTime || 0;
      animation.pause();
      sceneByLayer.get(backend)._zoomTransitions.set(animation, /* alloc */ { start: now, time });
    }
    // Freeze CSS between rendered frames: the compositor must not outrun the canvas.
    for ([animation, { start, time }] of sceneByLayer.get(backend)._zoomTransitions) {
      animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start);
    }
    if (sceneByLayer.get(backend)._zoomView) {
      const view = sceneByLayer.get(backend)._zoomView;
      let proxy;
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
  }
}
