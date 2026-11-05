import { sceneByLayer } from '../globals/sceneByLayer.js';
import { cameraByMap } from '../globals/cameraByMap.js';



export function ready(instance) {
  return sceneByLayer.get(instance)?.ready ||
    cameraByMap.get(instance)?.cameraReady || Promise.resolve(instance);
}
