import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';


export function createLayer(options = sceneEmptyOptions) {
  return /* allocation: required -- Create a native Leaflet layer with independent lifecycle state. */ new L.Layer(options);
}
