import { sceneByLayer } from '../globals/sceneByLayer.js';


export function addTimeLayer(map) {
  return sceneByLayer.get(this).control.addTo(map);
}
