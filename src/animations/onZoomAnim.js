import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';

import { pendingZoomAnimations } from '../globals/pendingZoomAnimations.js';


import { render } from "../rendering/render.js";

import { renderPendingZoomAnimation } from './renderPendingZoomAnimation.js';

export function onZoomAnim(event) {
  const map = this._map;
  if (event && !zoomViewByLayer.get(this)) {
    zoomViewByLayer.set(this, /* alloc */ { from: map.getCenter(), zoom: map.getZoom(), to: event.center,
      targetZoom: event.zoom, start: performance.now() });
    map.getContainer().classList.add('leaflet-camera-zoom');
  }
  pendingZoomAnimations.push(this);
  queueMicrotask(renderPendingZoomAnimation);
}
