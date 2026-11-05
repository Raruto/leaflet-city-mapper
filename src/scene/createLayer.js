import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';
import { layerInitialize } from './layerInitialize.js';


export function createLayer(options = sceneEmptyOptions) {
  const layer = /* allocation: required -- Create a native Leaflet layer with independent lifecycle state. */ new L.Layer();
  layerInitialize.call(layer, options);
  return layer;
}
