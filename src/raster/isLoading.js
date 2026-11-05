import { sceneByLayer } from '../globals/sceneByLayer.js';



export function isLoading(layer) {
  return sceneByLayer.get(layer)._loadingTiles > 0;
}
