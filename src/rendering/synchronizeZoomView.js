export function synchronizeZoomView(backend, now) {
  const map = backend._map;
  if (map._animatingZoom) {
    backend._zoomTransitions ||= new Map();
    for (const animation of map.getContainer().getAnimations({ subtree: true })) {
      if (!(animation instanceof CSSTransition) || animation.transitionProperty !== 'transform' ||
        !animation.effect.target.classList.contains('leaflet-zoom-animated') ||
        backend._zoomTransitions.has(animation)) {
        continue;
      }
      const time = animation.currentTime || 0;
      animation.pause();
      backend._zoomTransitions.set(animation, { start: now, time });
    }
    // Freeze CSS between rendered frames: the compositor must not outrun the canvas.
    for (const [animation, { start, time }] of backend._zoomTransitions) {
      animation.currentTime = Math.min(animation.effect.getComputedTiming().endTime, time + now - start);
    }
    if (backend._zoomView) {
      const view = backend._zoomView;
      let proxy;
      for (const animation of backend._zoomTransitions.keys()) {
        if (animation.effect.target === map._proxy) { proxy = animation; break; }
      }
      const progress = proxy?.effect.getComputedTiming().progress ?? Math.min(1, (now - view.start) / 250);
      const targetScale = map.getZoomScale(view.targetZoom, view.zoom), scale = 1 + (targetScale - 1) * progress;
      const from = map.project(view.from, view.zoom), to = map.project(view.to, view.zoom);
      map._cameraView = { zoom: map.getScaleZoom(scale, view.zoom),
        center: map.unproject(from.add(to.subtract(from).multiplyBy(targetScale * progress / scale)), view.zoom) };
      map._updateCameraOverlays();
    }
  }
}
