import { state as sharedState } from '../state.js';
import { pluginState } from './pluginState.js';


export function removeLayer(layer) {
  const id = L.Util.stamp(layer);
  if (!this._layers[id]) return this;
  const state = pluginState(layer);
  if (!state.onRemove) return sharedState.removeLayer.call(this, layer);
  if (this._loaded) state.onRemove.call(layer, this);
  delete this._layers[id];
  if (this._loaded) {
    this.fire('layerremove', /* allocation: required -- Native layer-removal listeners can retain or mutate event data. */ { layer });
    layer.fire('remove');
  }
  layer._map = layer._mapToAdd = null;
  return this;
}
