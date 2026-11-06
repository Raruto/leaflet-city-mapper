import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { areasByLayer } from '../weakmaps/areasByLayer.js';
import { countStatusByLayer } from '../weakmaps/countStatusByLayer.js';
import { directoriesByLayer } from '../weakmaps/directoriesByLayer.js';
import { geojsonByLayer } from '../weakmaps/geojsonByLayer.js';
import { inflightByLayer } from '../weakmaps/inflightByLayer.js';
import { kindByLayer } from '../weakmaps/kindByLayer.js';
import { locationByLayer } from '../weakmaps/locationByLayer.js';
import { modelUrlByLayer } from '../weakmaps/modelUrlByLayer.js';
import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { state3dByLayer } from '../weakmaps/state3dByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';

import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';


import { attach } from './attachSharedScene.js';
import { emptyNode } from './createSceneNode.js';
import { onAdd3DLayer } from './onAdd3DLayer.js';
import { onRemove3DLayer } from './onRemove3DLayer.js';
import { update } from './scheduleSceneUpdate.js';
import { updateArea } from '../sources/updateArea.js';
import { onTerrainChange } from '../terrain/onTerrainChange.js';
import { getHeader } from '../archives/getHeader.js';
import { loadModel } from '../models/loadModel.js';
import { get3DEvents } from './get3DEvents.js';
import { ready3D } from './ready3D.js';
import { noOperation } from '../utils/noOperation.js';
import { updateLayerCount } from '../layer-controls/updateLayerCount.js';

export function init3D(layer, options = sceneEmptyOptions) {
  state3dByLayer.set(layer, true);
  L.Util.setOptions(layer, /* alloc */ { ariaLabel: '3D scene', ...options });
  kindByLayer.set(layer, '3d');
  const isModel = !geojsonByLayer.get(layer) && /\.(glb|gltf)(?:[?#]|$)/i.test(layer.options.url);
  modelUrlByLayer.set(layer, isModel ? layer.options.url : null);
  urlByLayer.set(layer, layer.options.url && !isModel && !geojsonByLayer.get(layer) ? /* alloc */ new URL(layer.options.url, document.baseURI).href : null);
  directoriesByLayer.set(layer, /* alloc */ new Map());
  if (layer.options.center) {
    locationByLayer.set(layer, /* alloc */ new L.LatLng(layer.options.center[0], layer.options.center[1]));
  }
  areasByLayer.set(layer, /* alloc */ new Map());
  inflightByLayer.set(layer, 0);
  if (urlByLayer.get(layer) || geojsonByLayer.get(layer) || isModel) {
    const status = L.DomUtil.create('small', 'layer-count');
    status.style.cssText = 'float:right;margin-left:12px;color:#555;font-variant-numeric:tabular-nums';
    countStatusByLayer.set(layer, status);
    layer.on('add error', updateLayerCount);
    layer.on('ready progress', L.Util.throttle(updateLayerCount, 250, layer));
  }
  addedByLayer.set(layer, Promise.withResolvers());
  readyByLayer.set(layer, Promise.resolve().then(ready3D.bind(null, layer)));
  readyByLayer.get(layer).catch(noOperation);
}
