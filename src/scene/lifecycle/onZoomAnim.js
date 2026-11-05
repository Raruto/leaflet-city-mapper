import { render } from "../../rendering/render.js";
import { onZoomAnimState } from './constants/onZoomAnimState.js';
import { renderPendingZoomAnimation } from './renderPendingZoomAnimation.js';

onZoomAnimState.pendingZoomAnimations = [];

export function onZoomAnim(event) {
  const map = this._map;
  if (event && !this._zoomView) {
    this._zoomView = { from: map.getCenter(), zoom: map.getZoom(), to: event.center,
      targetZoom: event.zoom, start: performance.now() };
    map.getContainer().classList.add('leaflet-camera-zoom');
  }
  onZoomAnimState.pendingZoomAnimations.push(this);
  queueMicrotask(renderPendingZoomAnimation);
}
