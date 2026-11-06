import { zoomTransitionsByLayer } from '../weakmaps/zoomTransitionsByLayer.js';
import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';

import { meshStack } from '../globals/meshStack.js';
import { updateZoomCamera } from './updateZoomCamera.js';

export function synchronizeZoomView(layer, now) {
  const map = layer._map;
  let animation, time, start;
  if (map._animatingZoom) {
    if (!zoomTransitionsByLayer.get(layer)) zoomTransitionsByLayer.set(layer, /* alloc */ new Map());
    for (animation of map.getContainer().getAnimations(meshStack)) {
      if (!(animation instanceof CSSTransition) || animation.transitionProperty !== 'transform' ||
        !animation.effect.target.classList.contains('leaflet-zoom-animated') ||
        zoomTransitionsByLayer.get(layer).has(animation)) {
        continue;
      }
      time = animation.currentTime || 0;
      animation.pause();
      zoomTransitionsByLayer.get(layer).set(animation, /* alloc */ { start: now, time });
    }
    // Freeze CSS between rendered frames: the compositor must not outrun the canvas.
    for ([animation, { start, time }] of zoomTransitionsByLayer.get(layer)) {
      animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start);
    }
    if (zoomViewByLayer.get(layer)) updateZoomCamera(layer, now);
  }
}
