import { sceneByLayer } from '../globals/sceneByLayer.js';


export function shouldSkipOther(other, layer) {
  return other === layer || sceneByLayer.get(other)._type === 'terrain' || sceneByLayer.get(other)._type === 'traffic';
}
