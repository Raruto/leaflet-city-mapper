import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import * as attach from './attach.js';
import * as onClick from '../picking/onClick.js';
import * as onPointerLeave from '../picking/onPointerLeave.js';
import * as onPointerMove from '../picking/onPointerMove.js';
import { pointerMove } from '../picking/pointerMove.js';
import { pointerClick } from '../picking/pointerClick.js';
import { pointerLeave } from '../picking/pointerLeave.js';
import { attachLayer } from './attachLayer.js';

/** Attach interaction immediately; initialization may finish before or after onAdd. */
export function onAdd3DLayer(backend, map) {
  if (!sceneByLayer.get(backend).location) {
    const center = map.getCenter();
    sceneByLayer.get(backend).location = /* allocation: required -- Preserve this layer's independent map center. */ new L.LatLng(center.lat, center.lng);
  }
  if (sceneByLayer.get(backend).url || sceneByLayer.get(backend)._geojson || backend.options.tooltip || sceneByLayer.get(backend).modelUrl) {
    sceneByLayer.get(backend).container = map.getContainer();
    sceneByLayer.get(backend)._pointerEvents ||= /* allocation: required -- Retain one independent event map per source layer. */ {
      mousemove: pointerMove,
      click: pointerClick,
      mouseleave: pointerLeave,
    };
    if (backend.options.tooltip) {
      sceneByLayer.get(backend)._tooltip = L.DomUtil.create('div', 'leaflet-3d-tooltip', sceneByLayer.get(backend).container);
      sceneByLayer.get(backend)._tooltip.hidden = true;
      sceneByLayer.get(backend)._tooltip.setAttribute('role', 'tooltip');
      sceneByLayer.get(backend)._tooltip.setAttribute('aria-live', 'polite');
      sceneByLayer.get(backend)._tooltip.style.cssText = 'position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none';
    }
    L.DomEvent.on(sceneByLayer.get(backend).container, sceneByLayer.get(backend)._pointerEvents, backend);
  }
  if (sceneByLayer.get(backend).root) {
    attachLayer(backend, map);
  }
}
