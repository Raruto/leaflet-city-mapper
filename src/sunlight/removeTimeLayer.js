import { L } from '../globals/L.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


export function removeTimeLayer() {
  return L.Control.prototype.remove.call(sceneByLayer.get(this).control);
}
