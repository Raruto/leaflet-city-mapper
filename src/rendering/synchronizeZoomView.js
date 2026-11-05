import { mapUpdateCameraOverlays } from '../camera/mapUpdateCameraOverlays.js';
import { pluginState } from '../core/pluginState.js';
export function synchronizeZoomView(backend, now) {
  const map = backend._map;
  let animation, time, start;
  if (map._animatingZoom) {
    pluginState(backend)._zoomTransitions ||= /* allocation: required -- Each backend tracks the CSS transitions it paused until its zoom completes. */ new Map();
    for (animation of map.getContainer().getAnimations(sharedState.allocationRenderSubtree)) {
      if (!(animation instanceof CSSTransition) || animation.transitionProperty !== 'transform' ||
        !animation.effect.target.classList.contains('leaflet-zoom-animated') ||
        pluginState(backend)._zoomTransitions.has(animation)) {
        continue;
      }
      time = animation.currentTime || 0;
      animation.pause();
      pluginState(backend)._zoomTransitions.set(animation, /* allocation: required -- Each paused CSS transition retains its own start time and playback offset. */ { start: now, time });
    }
    // Freeze CSS between rendered frames: the compositor must not outrun the canvas.
    for ([animation, { start, time }] of pluginState(backend)._zoomTransitions) {
      animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start);
    }
    if (pluginState(backend)._zoomView) {
      const view = pluginState(backend)._zoomView;
      let proxy;
      for (animation of pluginState(backend)._zoomTransitions.keys()) {
        if (animation.effect.target === map._proxy) { proxy = animation; break; }
      }
      const progress = proxy?.effect.getComputedTiming().progress ?? Math.min(1, (now - view.start) / 250);
      const targetScale = map.getZoomScale(view.targetZoom, view.zoom), scale = 1 + (targetScale - 1) * progress;
      const from = map.project(view.from, view.zoom), to = map.project(view.to, view.zoom);
      pluginState(map)._cameraView = /* allocation: required -- The map retains its interpolated camera view for overlays and projection. */ { zoom: map.getScaleZoom(scale, view.zoom),
        center: map.unproject(from.add(to.subtract(from).multiplyBy(targetScale * progress / scale)), view.zoom) };
      mapUpdateCameraOverlays(map);
    }
  }
}
import { state as sharedState } from '../state.js';
