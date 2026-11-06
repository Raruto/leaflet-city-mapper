import { typeByLayer } from '../weakmaps/typeByLayer.js';



export function shouldSkipOther(other, layer) {
  return other === layer || typeByLayer.get(other) === 'terrain' || typeByLayer.get(other) === 'traffic';
}
