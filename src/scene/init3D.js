import { state as sharedState } from '../state.js';
import { pluginState } from '../core/pluginState.js';
import { attach } from './attach.js';
import { emptyNode } from './emptyNode.js';
import { onAdd3DLayer } from './onAdd3DLayer.js';
import { onRemove3DLayer } from './onRemove3DLayer.js';
import { update } from './update.js';
import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';
import { getHeader } from '../archives/getHeader.js';
import { loadModel } from '../models/loadModel.js';
import { get3DEvents } from './get3DEvents.js';
import { ready3D } from './ready3D.js';
import { noOperation } from '../utils/noOperation.js';

export function init3D(layer, options = sharedState.allocationSceneEmptyOptions) {
  pluginState(layer)._3d = true;
  L.Util.setOptions(layer, /* allocation: required -- Merge defaults and caller options for this layer. */ { ariaLabel: '3D scene', ...options });
  pluginState(layer).onAdd = onAdd3DLayer.bind(null, layer);
  pluginState(layer).onRemove = onRemove3DLayer.bind(null, layer);
  pluginState(layer).getEvents = get3DEvents.bind(null, layer);
  const isModel = !pluginState(layer)._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
  pluginState(layer).modelUrl = isModel ? layer.options.url : null;
  pluginState(layer).url = layer.options.url && !isModel && !pluginState(layer)._geojson ? /* allocation: required -- Resolve a stable absolute source URL for this layer. */ new URL(layer.options.url, document.baseURI).href : null;
  pluginState(layer)._directories = /* allocation: required -- Keep archive directories independent per layer. */ new Map();
  if (layer.options.center) {
    pluginState(layer).location = /* allocation: required -- Preserve each layer's independent center. */ new L.LatLng(layer.options.center[0], layer.options.center[1]);
  }
  pluginState(layer)._areas = /* allocation: required -- Keep area requests independent per layer. */ new Map();
  pluginState(layer)._inflight = 0;
  pluginState(layer)._added = Promise.withResolvers();
  pluginState(layer).ready = Promise.resolve().then(ready3D.bind(null, layer));
  pluginState(layer).ready.catch(noOperation);
}
