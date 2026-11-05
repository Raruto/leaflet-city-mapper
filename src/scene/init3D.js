import { attach } from './attach.js';
import { emptyNode } from './emptyNode.js';
import { onAdd3DLayer } from './onAdd3DLayer.js';
import { onRemove3DLayer } from './onRemove3DLayer.js';
import { update } from './update.js';
import { updateArea } from './updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';
import { getHeader } from '../pmtiles/getHeader.js';
import { loadModel } from '../model/loadModel.js';
import { get3DEvents } from './get3DEvents.js';
import { ready3D } from './ready3D.js';

export function init3D(layer, options = {}) {
  layer._3d = true;
  L.Util.setOptions(layer, { ariaLabel: '3D scene', ...options });
  layer.onAdd = onAdd3DLayer.bind(null, layer);
  layer.onRemove = onRemove3DLayer.bind(null, layer);
  layer.getEvents = get3DEvents.bind(null, layer);
  const isModel = !layer._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
  layer.modelUrl = isModel ? layer.options.url : null;
  layer.url = layer.options.url && !isModel && !layer._geojson ? new URL(layer.options.url, document.baseURI).href : null;
  layer._directories = new Map();
  if (layer.options.center) {
    layer.location = new L.LatLng(layer.options.center[0], layer.options.center[1]);
  }
  layer._areas = new Map();
  layer._inflight = 0;
  layer._added = Promise.withResolvers();
  queueMicrotask(ready3D.bind(null, layer));
}
