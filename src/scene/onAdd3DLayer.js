import { pluginState } from '../core/pluginState.js';
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
  if (!pluginState(backend).location) {
    const center = map.getCenter();
    pluginState(backend).location = /* allocation: required -- Preserve this layer's independent map center. */ new L.LatLng(center.lat, center.lng);
  }
  if (pluginState(backend).url || pluginState(backend)._geojson || backend.options.tooltip || pluginState(backend).modelUrl) {
    pluginState(backend).container = map.getContainer();
    pluginState(backend)._pointerEvents ||= /* allocation: required -- Retain one independent event map per source layer. */ {
      mousemove: pointerMove,
      click: pointerClick,
      mouseleave: pointerLeave,
    };
    if (backend.options.tooltip) {
      pluginState(backend)._tooltip = L.DomUtil.create('div', 'leaflet-3d-tooltip', pluginState(backend).container);
      pluginState(backend)._tooltip.hidden = true;
      pluginState(backend)._tooltip.setAttribute('role', 'tooltip');
      pluginState(backend)._tooltip.setAttribute('aria-live', 'polite');
      pluginState(backend)._tooltip.style.cssText = 'position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none';
    }
    L.DomEvent.on(pluginState(backend).container, pluginState(backend)._pointerEvents, backend);
  }
  if (pluginState(backend).root) {
    attachLayer(backend, map);
  }
}
