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
  if (!backend.location) {
    const center = map.getCenter();
    backend.location = new L.LatLng(center.lat, center.lng);
  }
  if (backend.url || backend._geojson || backend.options.tooltip || backend.modelUrl) {
    backend.container = map.getContainer();
    backend._pointerEvents ||= {
      mousemove: pointerMove,
      click: pointerClick,
      mouseleave: pointerLeave,
    };
    if (backend.options.tooltip) {
      backend._tooltip = L.DomUtil.create('div', 'leaflet-3d-tooltip', backend.container);
      backend._tooltip.hidden = true;
      backend._tooltip.setAttribute('role', 'tooltip');
      backend._tooltip.setAttribute('aria-live', 'polite');
      backend._tooltip.style.cssText = 'position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none';
    }
    L.DomEvent.on(backend.container, backend._pointerEvents, backend);
  }
  if (backend.root) {
    attachLayer(backend, map);
  }
}
