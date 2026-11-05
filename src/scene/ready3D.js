import { pluginState } from '../core/pluginState.js';
import { emptyNode } from './emptyNode.js';
import { getHeader } from '../archives/getHeader.js';
import { attach } from './attach.js';
import { loadModel } from '../models/loadModel.js';
import { update } from './update.js';

export async function ready3D(layer) {
  try {
    pluginState(layer).root = emptyNode();
    pluginState(layer).raycaster = /* allocation: required -- Keep this layer's ray-casting scratch independent. */ {
      origin: /* allocation: required -- Keep each layer's ray origin independent. */ [0, 0, 0],
      direction: /* allocation: required -- Keep each layer's ray direction independent. */ [0, 0, 0],
      inverse: /* allocation: required -- Reuse a transform matrix owned by this layer. */ new DOMMatrix(),
      meshes: /* allocation: required -- Keep concurrent layer hit lists independent. */ [],
    };
    if (pluginState(layer).url || pluginState(layer)._geojson) {
      pluginState(layer).group = pluginState(layer).root;
      if (pluginState(layer).url) pluginState(layer).header = await getHeader(layer);
    }
    if (layer._map) {
      await attach(layer, layer._map);
      pluginState(layer)._added.resolve();
    }
    if (pluginState(layer).modelUrl) await loadModel(layer);
    if (pluginState(layer)._shared) update(layer);
    layer.fire('ready');
    return layer;
  } catch (error) {
    layer.fire('error', /* allocation: required -- Preserve each layer's initialization error event. */ { error });
    throw error;
  }
}
