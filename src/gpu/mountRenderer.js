import { sizeByLayer } from '../weakmaps/sizeByLayer.js';

import { onMapChange } from '../scene/onMapChange.js';
import { startZoom } from '../animations/startZoom.js';
import { onZoomAnim } from '../animations/onZoomAnim.js';
import { endZoom } from '../animations/endZoom.js';

export function mountRenderer(layer, map, canvas) {
  sizeByLayer.set(layer, null);
  canvas.className = 'leaflet-3d';
  canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', layer.options.ariaLabel ?? '3D scene');
  let pane = map.getPane('webgpuPane');
  if (!pane) {
    pane = map.createPane('webgpuPane', map.getContainer());
    // The pitch sky uses 0 and may be inserted after this pane.
    pane.style.zIndex = 1;
    pane.style.pointerEvents = 'none';
  }
  pane.append(canvas);
  map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange, layer);
  map.on('zoomstart', startZoom, layer);
  map.on('zoomanim', onZoomAnim, layer);
  map.on('zoomend', endZoom, layer);
}
