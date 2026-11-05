import { emptyNode } from './emptyNode.js';
import { getHeader } from '../pmtiles/getHeader.js';
import { attach } from './attach.js';
import { loadModel } from '../model/loadModel.js';
import { update } from './update.js';

export async function ready3D(layer) {
  try {
    layer.root = emptyNode();
    layer.raycaster = { origin: [0, 0, 0], direction: [0, 0, 0] };
    if (layer.url || layer._geojson) {
      layer.group = layer.root;
      if (layer.url) layer.header = await getHeader(layer);
    }
    if (layer._map) {
      await attach(layer, layer._map);
      layer._added.resolve();
    }
    if (layer.modelUrl) await loadModel(layer);
    if (layer._shared) update(layer);
    layer.fire('ready');
  } catch (error) {
    layer.fire('error', { error });
  }
}
