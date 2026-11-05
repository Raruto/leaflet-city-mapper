import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';
import { removeLayer as sharedRemoveLayer } from '../globals/removeLayer.js';

import { removeSceneLayer } from '../scene/removeSceneLayer.js';



export function removeLayer(layer) {
  const id = L.Util.stamp(layer);
  if (!this._layers[id]) return this;
  const state = sceneByLayer.get(layer);
  if (!state.kind) return sharedRemoveLayer.value.call(this, layer);
  if (this._loaded) removeSceneLayer(layer, this);
  delete this._layers[id];
  if (this._loaded) {
    this.fire('layerremove', /* alloc */ { layer });
    layer.fire('remove');
  }
  layer._map = layer._mapToAdd = null;
  return this;
}
