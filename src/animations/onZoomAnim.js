import { zoomViewByLayer } from '../weakmaps/zoomViewByLayer.js';
import { pendingZoomAnimations } from '../globals/pendingZoomAnimations.js';
import { render } from "../rendering/render.js";
import { renderPendingZoomAnimation } from './renderPendingZoomAnimation.js';

/**
 * Capture the initial and target zoom view, then queue a render for this layer.
 *
 * @param {Object} [event] Leaflet zoom event containing the target center and zoom.
 */
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
