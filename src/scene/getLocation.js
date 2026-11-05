import { sceneByLayer } from '../globals/sceneByLayer.js';



export function getLocation(layer) {
  return sceneByLayer.get(layer)?.location;
}
