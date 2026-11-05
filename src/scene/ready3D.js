import { sceneByLayer } from '../globals/sceneByLayer.js';


import { emptyNode } from './emptyNode.js';
import { getHeader } from '../archives/getHeader.js';
import { attach } from './attach.js';
import { loadModel } from '../models/loadModel.js';
import { update } from './update.js';

export async function ready3D(layer) {
  try {
    sceneByLayer.get(layer).root = emptyNode();
    sceneByLayer.get(layer).raycaster = /* alloc */ {
      origin: /* alloc */ [0, 0, 0],
      direction: /* alloc */ [0, 0, 0],
      inverse: /* alloc */ new DOMMatrix(),
      meshes: /* alloc */ [],
    };
    if (sceneByLayer.get(layer).url || sceneByLayer.get(layer)._geojson) {
      sceneByLayer.get(layer).group = sceneByLayer.get(layer).root;
      if (sceneByLayer.get(layer).url) sceneByLayer.get(layer).header = await getHeader(layer);
    }
    if (layer._map) {
      await attach(layer, layer._map);
      sceneByLayer.get(layer)._added.resolve();
    }
    if (sceneByLayer.get(layer).modelUrl) await loadModel(layer);
    if (sceneByLayer.get(layer)._shared) update(layer);
    layer.fire('ready');
    return layer;
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
    throw error;
  }
}
