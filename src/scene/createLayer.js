import { layerInitialize } from './layerInitialize.js';
import { state as sharedState } from '../state.js';

export function createLayer(options = sharedState.allocationSceneEmptyOptions) {
  const layer = /* allocation: required -- Create a native Leaflet layer with independent lifecycle state. */ new L.Layer();
  layerInitialize.call(layer, options);
  return layer;
}
