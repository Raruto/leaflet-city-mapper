import { L } from '../globals/L.js';
import { sceneEmptyOptions } from '../globals/sceneEmptyOptions.js';


export function createLayer(options = sceneEmptyOptions) {
  return /* alloc */ new L.Layer(options);
}
