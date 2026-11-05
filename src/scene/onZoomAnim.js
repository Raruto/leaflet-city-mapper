import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { render } from "../rendering/render.js";

import { renderPendingZoomAnimation } from './renderPendingZoomAnimation.js';

export function onZoomAnim(event) {
  const map = this._map;
  if (event && !pluginState(this)._zoomView) {
    pluginState(this)._zoomView = /* allocation: required -- Retain this map's independent active zoom snapshot. */ { from: map.getCenter(), zoom: map.getZoom(), to: event.center,
      targetZoom: event.zoom, start: performance.now() };
    map.getContainer().classList.add('leaflet-camera-zoom');
  }
  sharedState.pendingZoomAnimations.push(this);
  queueMicrotask(renderPendingZoomAnimation);
}
