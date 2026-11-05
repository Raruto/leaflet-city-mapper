import { sceneByLayer } from '../globals/sceneByLayer.js';


import { emptyNode } from './emptyNode.js';
import { getHeader } from '../archives/getHeader.js';
import { attach } from './attach.js';
import { loadModel } from '../models/loadModel.js';
import { update } from './update.js';

export async function ready3D(layer) {
  try {
    sceneByLayer.get(layer).root = emptyNode();
    sceneByLayer.get(layer).raycaster = /* allocation: required -- Keep this layer's ray-casting scratch independent. */ {
      origin: /* allocation: required -- Keep each layer's ray origin independent. */ [0, 0, 0],
      direction: /* allocation: required -- Keep each layer's ray direction independent. */ [0, 0, 0],
      inverse: /* allocation: required -- Reuse a transform matrix owned by this layer. */ new DOMMatrix(),
      meshes: /* allocation: required -- Keep concurrent layer hit lists independent. */ [],
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
    layer.fire('error', /* allocation: required -- Preserve each layer's initialization error event. */ { error });
    throw error;
  }
}
