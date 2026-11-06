import { sceneByLayer } from '../globals/sceneByLayer.js';
import { meshStack } from '../globals/meshStack.js';
import { updateZoomCamera } from './updateZoomCamera.js';

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
    if (sceneByLayer.get(backend)._zoomView) updateZoomCamera(backend, now);
  }
}
