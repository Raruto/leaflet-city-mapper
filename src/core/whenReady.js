import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { cameraReadyByMap } from '../weakmaps/cameraReadyByMap.js';





export function ready(instance) {
  return readyByLayer.get(instance) ||
    cameraReadyByMap.get(instance) || Promise.resolve(instance);
}
