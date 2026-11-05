import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


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

export function init3D(layer, options = sceneEmptyOptions) {
  sceneByLayer.get(layer)._3d = true;
  L.Util.setOptions(layer, /* alloc */ { ariaLabel: '3D scene', ...options });
  sceneByLayer.get(layer).kind = '3d';
  const isModel = !sceneByLayer.get(layer)._geojson && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
  sceneByLayer.get(layer).modelUrl = isModel ? layer.options.url : null;
  sceneByLayer.get(layer).url = layer.options.url && !isModel && !sceneByLayer.get(layer)._geojson ? /* alloc */ new URL(layer.options.url, document.baseURI).href : null;
  sceneByLayer.get(layer)._directories = /* alloc */ new Map();
  if (layer.options.center) {
    sceneByLayer.get(layer).location = /* alloc */ new L.LatLng(layer.options.center[0], layer.options.center[1]);
  }
  sceneByLayer.get(layer)._areas = /* alloc */ new Map();
  sceneByLayer.get(layer)._inflight = 0;
  sceneByLayer.get(layer)._added = Promise.withResolvers();
  sceneByLayer.get(layer).ready = Promise.resolve().then(ready3D.bind(null, layer));
  sceneByLayer.get(layer).ready.catch(noOperation);
}
