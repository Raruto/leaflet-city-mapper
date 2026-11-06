import { sceneByLayer } from '../globals/sceneByLayer.js';
import { onMapChange } from './onMapChange.js';
import { startZoom } from './startZoom.js';
import { onZoomAnim } from './onZoomAnim.js';
import { endZoom } from './endZoom.js';

export function mountRenderer(backend, map, canvas) {
  sceneByLayer.get(backend)._size = null;
  canvas.className = 'leaflet-3d';
  canvas.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', backend.options.ariaLabel ?? '3D scene');
  let pane = map.getPane('webgpuPane');
  if (!pane) {
    pane = map.createPane('webgpuPane', map.getContainer());
    // The pitch sky uses 0 and may be inserted after this pane.
    pane.style.zIndex = 1;
    pane.style.pointerEvents = 'none';
  }
  pane.append(canvas);
  map.on('move zoom rotate pitch resize viewreset layeradd layerremove', onMapChange, backend);
  map.on('zoomstart', startZoom, backend);
  map.on('zoomanim', onZoomAnim, backend);
  map.on('zoomend', endZoom, backend);
}
