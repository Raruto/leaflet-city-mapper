import { containerByLayer } from '../weakmaps/containerByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { pointerEventsByLayer } from '../weakmaps/pointerEventsByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { tooltipByLayer } from '../weakmaps/tooltipByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';

import { L } from '../globals/L.js';


import * as attach from './attachSharedScene.js';
import * as onClick from '../picking/onClick.js';
import * as onPointerLeave from '../picking/onPointerLeave.js';
import * as onPointerMove from '../picking/onPointerMove.js';
import { pointerMove } from '../picking/pointerMove.js';
import { pointerClick } from '../picking/pointerClick.js';
import { pointerLeave } from '../picking/pointerLeave.js';
import { attachLayer } from './attachLayer.js';

/** Attach interaction immediately; initialization may finish before or after onAdd. */
export function onAdd3DLayer(layer, map) {
  if (!locationByLayer.get(layer)) {
    const center = map.getCenter();
    locationByLayer.set(layer, /* alloc */ new L.LatLng(center.lat, center.lng));
  }
  if (urlByLayer.get(layer) || geojsonByLayer.get(layer) || layer.options.tooltip || modelUrlByLayer.get(layer)) {
    containerByLayer.set(layer, map.getContainer());
    if (!pointerEventsByLayer.get(layer)) {
      pointerEventsByLayer.set(layer, /* alloc */ {
        mousemove: pointerMove,
        click: pointerClick,
        mouseleave: pointerLeave,
      });
    }
    if (layer.options.tooltip) {
      tooltipByLayer.set(layer, L.DomUtil.create('div', 'leaflet-3d-tooltip', containerByLayer.get(layer)));
      tooltipByLayer.get(layer).hidden = true;
      tooltipByLayer.get(layer).setAttribute('role', 'tooltip');
      tooltipByLayer.get(layer).setAttribute('aria-live', 'polite');
      tooltipByLayer.get(layer).style.cssText = 'position:absolute;z-index:600;max-width:220px;padding:10px 12px;border:1px solid #6b5140;border-radius:6px;background:#fffaf0;box-shadow:0 3px 12px #0005;color:#30251d;font:13px/1.45 sans-serif;pointer-events:none';
    }
    L.DomEvent.on(containerByLayer.get(layer), pointerEventsByLayer.get(layer), layer);
  }
  if (rootByLayer.get(layer)) {
    attachLayer(layer, map);
  }
}
